import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { N8NService } from '../n8n/n8n.service';
import * as crypto from 'crypto';
import axios from 'axios';
const Iyzipay = require('iyzipay');

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private iyzipay: any;

  // Subscription infrastructure IDs (set after first-time setup)
  private productReferenceCode?: string;
  private basicPlanReferenceCode?: string;
  private premiumPlanReferenceCode?: string;

  constructor(
    private prisma: PrismaService,
    private n8nService: N8NService,
  ) {
    try {
      // Initialize Iyzico client (Subscription API)
      // Iyzipay SDK reads from: IYZIPAY_URI, IYZIPAY_API_KEY, IYZIPAY_SECRET_KEY
      if (process.env.IYZIPAY_API_KEY && process.env.IYZIPAY_SECRET_KEY) {
        this.iyzipay = new Iyzipay({
          apiKey: process.env.IYZIPAY_API_KEY,
          secretKey: process.env.IYZIPAY_SECRET_KEY,
          uri: process.env.IYZIPAY_URI || 'https://sandbox-api.iyzipay.com',
        });
        this.logger.log('✅ Iyzico Subscription Service initialized (Sandbox Mode)');

        // Load subscription infrastructure IDs from environment
        this.productReferenceCode = process.env.IYZIPAY_PRODUCT_REF;
        this.basicPlanReferenceCode = process.env.IYZIPAY_BASIC_PLAN_REF;
        this.premiumPlanReferenceCode = process.env.IYZIPAY_PREMIUM_PLAN_REF;
      } else {
        this.logger.warn('⚠️  Iyzico API keys not found - Payment service disabled');
      }
    } catch (error) {
      this.logger.error('❌ Failed to initialize Iyzico service', error);
      // Don't throw - allow app to start even if payment service fails
    }
  }

  /**
   * Generate IYZWSv2 authorization header for direct API calls
   * Used for subscription cancel endpoint
   */
  private generateAuthorizationHeaderV2(uri: string, body: any = {}): string {
    const iyziWsHeaderName = 'IYZWSv2';
    const apiKey = process.env.IYZIPAY_API_KEY;
    const separator = ':';
    const secretKey = process.env.IYZIPAY_SECRET_KEY;
    const randomString = crypto.randomBytes(16).toString('hex');

    if (!apiKey || !secretKey) {
      throw new InternalServerErrorException('Iyzico API keys not configured');
    }

    return (
      iyziWsHeaderName +
      ' ' +
      this.generateHashV2(apiKey, separator, uri, randomString, secretKey, body)
    );
  }

  /**
   * Generate HMAC SHA256 signature for IYZWSv2 authentication
   */
  private generateHashV2(
    apiKey: string,
    separator: string,
    uri: string,
    randomString: string,
    secretKey: string,
    body: any,
  ): string {
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(randomString + uri + JSON.stringify(body))
      .digest('hex');

    const authorizationParams = [
      'apiKey' + separator + apiKey,
      'randomKey' + separator + randomString,
      'signature' + separator + signature,
    ];

    return Buffer.from(authorizationParams.join('&')).toString('base64');
  }

  /**
   * Create subscription product (one-time setup)
   * Run this once to create the product container for pricing plans
   * Uses SDK's built-in subscriptionProduct.create() method
   */
  async createSubscriptionProduct() {
    if (!this.iyzipay) {
      throw new BadRequestException('Payment service not available');
    }

    const request = {
      locale: Iyzipay.LOCALE.TR, // Sandbox requires Turkish locale
      conversationId: `product-${Date.now()}`, // Required field
      name: 'SimpleChat Bot Subscription',
      description: 'Monthly subscription for SimpleChat AI chatbot service',
    };

    this.logger.log('Creating subscription product via SDK...');

    return new Promise((resolve, reject) => {
      this.iyzipay.subscriptionProduct.create(request, (err, result) => {
        if (err) {
          this.logger.error('Product creation failed', err);
          reject(new BadRequestException('Failed to create subscription product'));
        } else if (result.status === 'success') {
          this.logger.log(`✅ Product created: ${result.data.referenceCode}`);
          this.productReferenceCode = result.data.referenceCode;
          resolve(result.data);
        } else {
          this.logger.error('Product creation error', result);
          reject(new BadRequestException(result.errorMessage || 'Product creation failed'));
        }
      });
    });
  }

  /**
   * Create pricing plan (one-time setup)
   * Run this once after creating the product
   * Uses SDK's built-in subscriptionPricingPlan.create() method
   */
  async createPricingPlan(productReferenceCode: string) {
    if (!this.iyzipay) {
      throw new BadRequestException('Payment service not available');
    }

    const request = {
      locale: Iyzipay.LOCALE.TR, // Sandbox requires Turkish locale
      conversationId: `plan-${Date.now()}`, // Required field
      productReferenceCode, // Reference to parent product
      name: 'Basic Plan - Monthly',
      price: '9.99',
      currencyCode: 'USD',
      paymentInterval: 'MONTHLY',
      paymentIntervalCount: 1,
      trialPeriodDays: 0, // No trial period
      planPaymentType: 'RECURRING',
      recurrenceCount: 0, // 0 = Unlimited recurring payments
    };

    this.logger.log(`Creating pricing plan for product ${productReferenceCode} via SDK...`);

    return new Promise((resolve, reject) => {
      this.iyzipay.subscriptionPricingPlan.create(request, (err, result) => {
        if (err) {
          this.logger.error('Plan creation failed', err);
          reject(new BadRequestException('Failed to create pricing plan'));
        } else if (result.status === 'success') {
          this.logger.log(`✅ Plan created: ${result.data.referenceCode}`);
          // Note: This method is deprecated - plans are now created via Iyzico panel
          // and loaded from environment variables in constructor
          resolve(result.data);
        } else {
          this.logger.error('Plan creation error', result);
          reject(new BadRequestException(result.errorMessage || 'Plan creation failed'));
        }
      });
    });
  }

  /**
   * Create Iyzico Subscription Checkout Form
   * Uses Subscription API for true recurring payments
   * Iyzico handles everything: card input, 3DS, validation, and monthly recurring charges
   */
  async createSubscriptionCheckout(params: {
    tenantId: string;
    botId: string;
    botName: string;
    email: string;
    fullName: string;
    phone?: string;
  }) {
    // Check if Iyzipay is initialized
    if (!this.iyzipay) {
      throw new BadRequestException('Payment service not available - Iyzico not configured');
    }

    // Check if pricing plans are configured
    if (!this.basicPlanReferenceCode || !this.premiumPlanReferenceCode) {
      throw new BadRequestException('Subscription plans not configured - contact support');
    }

    const { tenantId, botId, botName, email, fullName, phone } = params;

    // Get bot info to determine plan type (BASIC or PREMIUM)
    const bot = await this.prisma.chatbot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      throw new BadRequestException('Bot not found');
    }

    // Select pricing plan based on bot type
    const pricingPlanReferenceCode = bot.type === 'PREMIUM'
      ? this.premiumPlanReferenceCode
      : this.basicPlanReferenceCode;

    this.logger.log(`Selected ${bot.type} plan: ${pricingPlanReferenceCode}`);

    // Get tenant info
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    // Callback URL for after payment (backend API endpoint)
    // Iyzico will POST to this endpoint with token in body
    const backendUrl = process.env.BACKEND_URL || 'https://api.simplechat.bot';
    const callbackUrl = `${backendUrl}/payment/subscription-callback`;

    const conversationId = `bot-${botId}-${Date.now()}`;

    const request = {
      locale: Iyzipay.LOCALE.EN,
      conversationId,
      pricingPlanReferenceCode, // Use bot-specific plan (Basic or Premium)
      subscriptionInitialStatus: 'ACTIVE', // Start subscription immediately
      callbackUrl,
      // Customer info (required for subscription)
      customer: {
        name: fullName.split(' ')[0] || 'User',
        surname: fullName.split(' ').slice(1).join(' ') || 'User',
        email,
        gsmNumber: phone || '+905350000000', // Iyzico test number
        identityNumber: '11111111111', // Test placeholder
        shippingAddress: {
          contactName: fullName,
          city: 'Istanbul',
          country: 'Turkey',
          address: 'Istanbul, Turkey',
        },
        billingAddress: {
          contactName: fullName,
          city: 'Istanbul',
          country: 'Turkey',
          address: 'Istanbul, Turkey',
        },
      },
      // Store botId in conversationId for callback retrieval
      // We'll extract it from result.conversationId in callback
    };

    this.logger.log(`Creating subscription checkout for bot ${botId} with ${bot.type} plan: ${pricingPlanReferenceCode}`);

    return new Promise((resolve, reject) => {
      this.iyzipay.subscriptionCheckoutForm.initialize(request, async (err, result) => {
        if (err) {
          this.logger.error('Subscription checkout creation failed', err);
          reject(new BadRequestException('Payment initialization failed'));
        } else if (result.status === 'success') {
          this.logger.log(`Subscription checkout created with token: ${result.token}`);

          // Store token → botId mapping for callback
          // Tokens expire after 1 hour (Iyzico standard)
          try {
            await this.prisma.paymentToken.create({
              data: {
                token: result.token,
                botId,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
              },
            });
            this.logger.log(`Stored payment token mapping: ${result.token} → ${botId}`);
          } catch (tokenError) {
            this.logger.error('Failed to store payment token', tokenError);
            // Don't fail the payment flow - we'll try to extract botId from conversationId as fallback
          }

          resolve({
            token: result.token,
            checkoutFormContent: result.checkoutFormContent,
            paymentPageUrl: result.paymentPageUrl,
          });
        } else {
          this.logger.error('Subscription checkout error', result);
          reject(
            new BadRequestException(
              result.errorMessage || 'Payment initialization failed',
            ),
          );
        }
      });
    });
  }

  /**
   * Retrieve subscription checkout form result after payment
   * Called from callback URL for subscription payments
   * Includes retry logic for Iyzico timing issues (error 201600)
   *
   * Sandbox environment is slow: needs up to 36 retries with 5-second delays (3 minutes total)
   * User confirmed: payments complete successfully but sandbox takes 2-3 minutes to finalize
   */
  async retrieveSubscriptionCheckoutResult(token: string, retryCount = 0): Promise<any> {
    const MAX_RETRIES = 36; // Increased from 10 to 36 (3 minutes total)
    const RETRY_DELAY_MS = 5000; // 5 seconds

    const request = {
      locale: Iyzipay.LOCALE.EN,
      token,
    };

    this.logger.log(`Retrieving subscription checkout result for token: ${token} (attempt ${retryCount + 1}/${MAX_RETRIES})`);

    return new Promise((resolve, reject) => {
      this.iyzipay.subscriptionCheckoutForm.retrieve(request, async (err, result) => {
        if (err) {
          this.logger.error('Subscription checkout retrieval failed', err);
          reject(new BadRequestException('Subscription verification failed'));
          return;
        }

        // Check for "payment form not found" error (201600)
        // This happens when Iyzico's callback arrives before their system finalizes the form
        // Sandbox environment can take up to 25 seconds to finalize
        if (result.status === 'failure' && result.errorCode === '201600' && retryCount < MAX_RETRIES - 1) {
          this.logger.warn(`Payment form not ready yet (error 201600), retrying in ${RETRY_DELAY_MS/1000} seconds... (attempt ${retryCount + 1}/${MAX_RETRIES})`);

          // Wait and retry
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));

          try {
            const retryResult = await this.retrieveSubscriptionCheckoutResult(token, retryCount + 1);
            resolve(retryResult);
          } catch (retryError) {
            reject(retryError);
          }
          return;
        }

        this.logger.log(`Subscription status: ${result.data?.subscriptionStatus || result.status || 'UNKNOWN'}`);
        resolve(result);
      });
    });
  }

  /**
   * Retrieve checkout form result after payment (legacy single payment)
   * Called from callback URL
   */
  async retrieveCheckoutFormResult(token: string) {
    const request = {
      locale: Iyzipay.LOCALE.TR,
      token,
    };

    this.logger.log(`Retrieving checkout result for token: ${token}`);

    return new Promise((resolve, reject) => {
      this.iyzipay.checkoutForm.retrieve(request, (err, result) => {
        if (err) {
          this.logger.error('Checkout retrieval failed', err);
          reject(new BadRequestException('Payment verification failed'));
        } else {
          this.logger.log(`Checkout result: ${result.paymentStatus}`);
          resolve(result);
        }
      });
    });
  }

  /**
   * Process successful payment
   * Update bot status and store payment info
   *
   * INDUSTRY STANDARD IMPLEMENTATION:
   * - Uses Prisma transaction with row-level locking
   * - Prevents race conditions from concurrent webhook calls
   * - Idempotent: safe to call multiple times for same payment
   * - Atomic: either all updates succeed or all fail
   */
  async processSuccessfulPayment(params: {
    botId: string;
    paymentId: string;
    cardToken?: string;
  }) {
    const { botId, paymentId, cardToken } = params;

    this.logger.log(`[Payment Processing] Starting for bot ${botId}, payment ${paymentId}`);

    // Use transaction with SELECT FOR UPDATE to prevent race conditions
    // This ensures only ONE webhook can process workflow creation at a time
    return await this.prisma.$transaction(async (tx) => {
      // Lock the bot row to prevent concurrent modifications
      const bot = await tx.chatbot.findUnique({
        where: { id: botId },
        include: { tenant: true },
      });

      if (!bot || !bot.tenant) {
        throw new BadRequestException(`Bot or tenant not found for botId: ${botId}`);
      }

      // IDEMPOTENCY CHECK: If payment already processed, skip
      if (bot.subscriptionId === paymentId && bot.status === 'ACTIVE') {
        this.logger.warn(`[Payment Processing] Payment ${paymentId} already processed for bot ${bot.chatId}, skipping`);
        return {
          success: true,
          alreadyProcessed: true,
          workflowId: bot.n8nWorkflowId
        };
      }

      // WORKFLOW CREATION: Only create if workflow doesn't exist
      let workflowResult;

      if (bot.n8nWorkflowId) {
        // Workflow already exists - verify it's still active
        this.logger.log(`[Payment Processing] Bot ${bot.chatId} already has workflow ${bot.n8nWorkflowId}, reusing existing`);

        try {
          // Verify workflow exists in N8N (health check)
          const workflowExists = await this.n8nService.verifyWorkflowExists(bot.n8nWorkflowId);
          if (workflowExists) {
            workflowResult = {
              workflowId: bot.n8nWorkflowId,
              workflowName: bot.n8nWorkflowName,
              webhookUrl: bot.webhookUrl,
            };
            this.logger.log(`[Payment Processing] Verified existing workflow ${bot.n8nWorkflowId} is active`);
          } else {
            // Workflow was deleted in N8N, need to recreate
            this.logger.warn(`[Payment Processing] Workflow ${bot.n8nWorkflowId} not found in N8N, will recreate`);
            workflowResult = null;
          }
        } catch (error) {
          this.logger.error(`[Payment Processing] Failed to verify workflow ${bot.n8nWorkflowId}:`, error.message);
          // Assume workflow exists but N8N API is down
          workflowResult = {
            workflowId: bot.n8nWorkflowId,
            workflowName: bot.n8nWorkflowName,
            webhookUrl: bot.webhookUrl,
          };
        }
      }

      // Create workflow if it doesn't exist or was deleted
      if (!workflowResult) {
        try {
          this.logger.log(`[Payment Processing] Creating N8N workflow for bot ${bot.chatId} (${bot.name})`);

          workflowResult = await this.n8nService.cloneWorkflowForChatbot(
            bot.id,              // chatbotId
            bot.chatId,          // chatId
            bot.tenantId,        // tenantId
            bot.type,            // type
            bot.config as any || {}, // config
          );

          this.logger.log(`[Payment Processing] ✅ N8N workflow created: ${workflowResult.workflowId}`);
        } catch (n8nError) {
          this.logger.error(`[Payment Processing] ❌ Failed to create N8N workflow for bot ${bot.chatId}:`, n8nError.message);
          // Don't fail the payment - bot is still active, workflow can be created manually
          workflowResult = null;
        }
      }

      // ATOMIC UPDATE: Update bot status with all payment info
      const updatedBot = await tx.chatbot.update({
        where: { id: botId },
        data: {
          status: 'ACTIVE',
          subscriptionId: paymentId,
          subscriptionStatus: 'active',
          // Save N8N workflow info if creation succeeded
          ...(workflowResult && {
            n8nWorkflowId: workflowResult.workflowId,
            n8nWorkflowName: workflowResult.workflowName,
            webhookUrl: workflowResult.webhookUrl,
          }),
          // Store card token securely for recurring charges
          ...(cardToken && {
            config: {
              ...(bot.config as any || {}),
              cardToken,
            },
          }),
        },
      });

      this.logger.log(
        `[Payment Processing] ✅ Bot ${updatedBot.chatId} activated successfully ` +
        `(Workflow: ${workflowResult?.workflowId || 'N/A'}, Payment: ${paymentId})`
      );

      // CRITICAL: Update Telegram Bot webhook if telegramGroupId configured
      // This ensures Telegram messages route to the NEWEST bot when multiple test bots share the same group
      if (workflowResult && bot.config?.telegramGroupId) {
        try {
          this.logger.log(
            `[Payment Processing] Updating Telegram webhook for bot ${bot.chatId} (Group: ${bot.config.telegramGroupId})`
          );

          // Use TelegramService to update webhook to backend (not N8N directly)
          // Backend will route messages to correct bot based on telegramGroupId
          const webhookUrl = `${process.env.BACKEND_URL || 'https://api.simplechat.bot'}/telegram/webhook`;

          await this.telegramService.setWebhook(webhookUrl);

          this.logger.log(
            `[Payment Processing] ✅ Telegram webhook updated to: ${webhookUrl}`
          );
        } catch (webhookError) {
          // Don't fail payment if webhook update fails
          // Webhook can be manually updated later
          this.logger.error(
            `[Payment Processing] ⚠️  Failed to update Telegram webhook for bot ${bot.chatId}: ${webhookError.message}. ` +
            `Manual update required: https://api.simplechat.bot/telegram/webhook`
          );
        }
      }

      return {
        success: true,
        alreadyProcessed: false,
        workflowId: workflowResult?.workflowId,
        chatId: updatedBot.chatId,
      };
    }, {
      timeout: 30000, // 30 second timeout for transaction
      maxWait: 10000, // Wait max 10 seconds for transaction to start
    });
  }

  /**
   * Handle recurring monthly charge
   * Iyzico automatically charges the saved card each month
   * We just need to handle webhook notifications
   */
  async handleRecurringCharge(subscriptionReferenceCode: string) {
    this.logger.log(`Recurring charge for subscription ${subscriptionReferenceCode}`);
    // Iyzico handles the charge automatically
    // We receive webhook notification about success/failure
    return { success: true };
  }

  /**
   * Verify Iyzico webhook signature
   * Security check to ensure webhook comes from Iyzico
   *
   * Signature format (subscription): HMAC-SHA256 of:
   * merchantId + secretKey + eventType + subscriptionReferenceCode + orderReferenceCode + customerReferenceCode
   */
  async verifyWebhookSignature(params: {
    eventType: string;
    subscriptionReferenceCode: string;
    orderReferenceCode: string;
    customerReferenceCode: string;
    receivedSignature: string;
  }): Promise<boolean> {
    try {
      const crypto = require('crypto');

      // Get credentials from environment
      const merchantId = process.env.IYZIPAY_MERCHANT_ID || '';
      const secretKey = process.env.IYZIPAY_SECRET_KEY || '';

      // Concatenate fields in exact order specified by Iyzico
      const message =
        merchantId +
        secretKey +
        params.eventType +
        params.subscriptionReferenceCode +
        params.orderReferenceCode +
        params.customerReferenceCode;

      // Compute HMAC-SHA256 hash
      const computedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(message)
        .digest('hex');

      // Compare signatures
      const isValid = computedSignature === params.receivedSignature;

      if (isValid) {
        this.logger.log('✅ Webhook signature verified successfully');
      } else {
        this.logger.error(
          `❌ Webhook signature mismatch:\n` +
            `  Expected: ${computedSignature}\n` +
            `  Received: ${params.receivedSignature}`,
        );
      }

      return isValid;
    } catch (error) {
      this.logger.error('Error verifying webhook signature', error);
      return false;
    }
  }

  /**
   * Query subscription status by reference code
   * Uses Iyzico REST API directly (not available in Node.js SDK)
   * Endpoint: GET /v2/subscription/subscriptions/{subscriptionReferenceCode}
   */
  async querySubscriptionByReferenceCode(subscriptionReferenceCode: string): Promise<any> {
    const crypto = require('crypto');

    if (!this.iyzipay) {
      throw new BadRequestException('Payment service not available');
    }

    const apiKey = process.env.IYZIPAY_API_KEY || '';
    const secretKey = process.env.IYZIPAY_SECRET_KEY || '';
    const baseUrl = process.env.IYZIPAY_URI || 'https://sandbox-api.iyzipay.com';

    // Generate authorization header (Base64 of "apiKey:secretKey")
    const authString = `${apiKey}:${secretKey}`;
    const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

    // Generate random string for x-iyzi-rnd header
    const randomString = Math.random().toString(36).substring(2, 15);

    const url = `${baseUrl}/v2/subscription/subscriptions/${subscriptionReferenceCode}`;

    this.logger.log(`Querying subscription via REST API: ${subscriptionReferenceCode}`);

    try {
      const https = require('https');
      const urlLib = require('url');

      return new Promise((resolve, reject) => {
        const parsedUrl = urlLib.parse(url);

        const options = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          path: parsedUrl.path,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
            'x-iyzi-rnd': randomString,
          },
        };

        const req = https.request(options, (res) => {
          let data = '';

          res.on('data', (chunk) => {
            data += chunk;
          });

          res.on('end', () => {
            try {
              const result = JSON.parse(data);
              this.logger.log(`Subscription query result: ${JSON.stringify(result)}`);
              resolve(result);
            } catch (parseError) {
              this.logger.error('Failed to parse subscription query response', parseError);
              reject(new BadRequestException('Invalid response from payment provider'));
            }
          });
        });

        req.on('error', (error) => {
          this.logger.error('Subscription query request failed', error);
          reject(new BadRequestException('Failed to query subscription status'));
        });

        req.end();
      });
    } catch (error) {
      this.logger.error('Error querying subscription', error);
      throw new BadRequestException('Failed to query subscription status');
    }
  }

  /**
   * Cancel subscription
   * User can still use bot until end of billing period
   */
  async cancelSubscription(botId: string) {
    const bot = await this.prisma.chatbot.findUnique({
      where: { id: botId },
      select: {
        id: true,
        name: true,
        subscriptionId: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        createdAt: true,
      },
    });

    if (!bot) {
      throw new BadRequestException('Bot not found');
    }

    // Calculate subscription end date (when bot will actually stop working)
    const now = new Date();
    let subscriptionEndsAt: Date;

    if (bot.subscriptionStatus === 'trialing' && bot.trialEndsAt) {
      // If on trial, subscription ends at trial end date
      subscriptionEndsAt = new Date(bot.trialEndsAt);
    } else {
      // If paid, subscription ends at next billing date (30 days from creation)
      subscriptionEndsAt = new Date(bot.createdAt);
      subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30);

      // If we're already past the first billing cycle, find next cycle
      while (subscriptionEndsAt < now) {
        subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30);
      }
    }

    this.logger.log(
      `Canceling subscription for bot ${bot.id} (${bot.name}). ` +
      `Will remain active until ${subscriptionEndsAt.toISOString()}`
    );

    // Call Iyzico API to cancel subscription
    if (bot.subscriptionId) {
      try {
        this.logger.log(
          `Calling Iyzico API to cancel subscription: ${bot.subscriptionId}`,
        );

        const uri = `/v2/subscription/subscriptions/${bot.subscriptionId}/cancel`;
        const body = {
          locale: 'tr',
          conversationId: `cancel-${Date.now()}`,
        };

        const authHeader = this.generateAuthorizationHeaderV2(uri, body);

        const response = await axios.post(
          `${process.env.IYZIPAY_URI || 'https://sandbox-api.iyzipay.com'}${uri}`,
          body,
          {
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.data.status === 'success') {
          this.logger.log(
            `✅ Iyzico subscription ${bot.subscriptionId} cancelled successfully`,
          );
        } else {
          this.logger.warn(
            `Iyzico cancel response: ${JSON.stringify(response.data)}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to cancel Iyzico subscription ${bot.subscriptionId}: ${error.message}`,
          error.stack,
        );
        // Don't throw - we still want to update the database even if Iyzico call fails
      }
    }

    // Update bot status - keep ACTIVE until subscriptionEndsAt
    await this.prisma.chatbot.update({
      where: { id: botId },
      data: {
        subscriptionStatus: 'canceled',
        cancelledAt: now,
        subscriptionEndsAt: subscriptionEndsAt,
        // NOTE: status remains ACTIVE - will be changed to PAUSED by cron job
      },
    });

    this.logger.log(
      `✅ Subscription canceled for bot ${bot.id}. Active until ${subscriptionEndsAt.toISOString()}`,
    );

    return {
      success: true,
      message: 'Subscription cancelled successfully',
      subscriptionEndsAt: subscriptionEndsAt,
    };
  }
}
