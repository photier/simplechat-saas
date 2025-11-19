import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
const Iyzipay = require('iyzipay');

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private iyzipay: any;

  // Subscription infrastructure IDs (set after first-time setup)
  private productReferenceCode?: string;
  private pricingPlanReferenceCode?: string;

  constructor(private prisma: PrismaService) {
    try {
      // Initialize Iyzico client (Subscription API)
      // Iyzipay SDK reads from: IYZIPAY_URI, IYZIPAY_API_KEY, IYZIPAY_SECRET_KEY
      // We map our IYZICO_* variables to IYZIPAY_* format
      if (process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY) {
        // Set environment variables for Iyzipay SDK
        process.env.IYZIPAY_URI = process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com';
        process.env.IYZIPAY_API_KEY = process.env.IYZICO_API_KEY;
        process.env.IYZIPAY_SECRET_KEY = process.env.IYZICO_SECRET_KEY;

        this.iyzipay = new Iyzipay({
          apiKey: process.env.IYZICO_API_KEY,
          secretKey: process.env.IYZICO_SECRET_KEY,
          uri: process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com',
        });
        this.logger.log('✅ Iyzico Subscription Service initialized (Sandbox Mode)');

        // Load subscription infrastructure IDs from environment
        this.productReferenceCode = process.env.IYZICO_PRODUCT_REF;
        this.pricingPlanReferenceCode = process.env.IYZICO_PLAN_REF;
      } else {
        this.logger.warn('⚠️  Iyzico API keys not found - Payment service disabled');
      }
    } catch (error) {
      this.logger.error('❌ Failed to initialize Iyzico service', error);
      // Don't throw - allow app to start even if payment service fails
    }
  }

  /**
   * Create subscription product (one-time setup)
   * Run this once to create the product container for pricing plans
   * Uses direct HTTP call to v2 API (SDK doesn't support subscriptions)
   */
  async createSubscriptionProduct() {
    if (!this.iyzipay) {
      throw new BadRequestException('Payment service not available');
    }

    const request = {
      locale: 'en',
      name: 'SimpleChat Bot Subscription',
      description: 'Monthly subscription for SimpleChat AI chatbot service',
    };

    this.logger.log('Creating subscription product via v2 API...');

    const crypto = require('crypto');
    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;
    const baseUrl = process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com';

    // Create authorization header (Iyzico format)
    const randomString = Math.random().toString(36).substring(7);
    const requestBody = JSON.stringify(request);
    const authString = `${randomString}${requestBody}`;
    const signature = crypto.createHmac('sha256', secretKey).update(authString).digest('base64');
    const authHeader = `IYZWS ${apiKey}:${signature}`;

    try {
      const response = await fetch(`${baseUrl}/v2/subscription/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'x-iyzi-rnd': randomString,
        },
        body: requestBody,
      });

      const result = await response.json();

      if (result.status === 'success') {
        this.logger.log(`✅ Product created: ${result.data.referenceCode}`);
        this.productReferenceCode = result.data.referenceCode;
        return result.data;
      } else {
        this.logger.error('Product creation error', result);
        throw new BadRequestException(result.errorMessage || 'Product creation failed');
      }
    } catch (error) {
      this.logger.error('Product creation failed', error);
      throw new BadRequestException('Failed to create subscription product');
    }
  }

  /**
   * Create pricing plan (one-time setup)
   * Run this once after creating the product
   * Uses direct HTTP call to v2 API (SDK doesn't support subscriptions)
   */
  async createPricingPlan(productReferenceCode: string) {
    if (!this.iyzipay) {
      throw new BadRequestException('Payment service not available');
    }

    const request = {
      locale: 'en',
      name: 'Basic Plan - Monthly',
      price: '9.99',
      currencyCode: 'USD',
      paymentInterval: 'MONTHLY',
      paymentIntervalCount: 1,
      trialPeriodDays: 0, // No trial period
      planPaymentType: 'RECURRING',
      recurrenceCount: null, // Unlimited recurring payments
    };

    this.logger.log(`Creating pricing plan for product ${productReferenceCode} via v2 API...`);

    const crypto = require('crypto');
    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;
    const baseUrl = process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com';

    // Create authorization header (Iyzico format)
    const randomString = Math.random().toString(36).substring(7);
    const requestBody = JSON.stringify(request);
    const authString = `${randomString}${requestBody}`;
    const signature = crypto.createHmac('sha256', secretKey).update(authString).digest('base64');
    const authHeader = `IYZWS ${apiKey}:${signature}`;

    try {
      const response = await fetch(`${baseUrl}/v2/subscription/products/${productReferenceCode}/pricing-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'x-iyzi-rnd': randomString,
        },
        body: requestBody,
      });

      const result = await response.json();

      if (result.status === 'success') {
        this.logger.log(`✅ Plan created: ${result.data.referenceCode}`);
        this.pricingPlanReferenceCode = result.data.referenceCode;
        return result.data;
      } else {
        this.logger.error('Plan creation error', result);
        throw new BadRequestException(result.errorMessage || 'Plan creation failed');
      }
    } catch (error) {
      this.logger.error('Plan creation failed', error);
      throw new BadRequestException('Failed to create pricing plan');
    }
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

    // Check if pricing plan is configured
    if (!this.pricingPlanReferenceCode) {
      throw new BadRequestException('Subscription plan not configured - contact support');
    }

    const { tenantId, botId, botName, email, fullName, phone } = params;

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
      pricingPlanReferenceCode: this.pricingPlanReferenceCode,
      subscriptionInitialStatus: 'ACTIVE', // Start subscription immediately
      callbackUrl,
      // Customer info (required for subscription)
      customer: {
        name: fullName.split(' ')[0] || 'User',
        surname: fullName.split(' ').slice(1).join(' ') || 'User',
        email,
        gsmNumber: phone || '+905000000000',
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

    this.logger.log(`Creating subscription checkout for bot ${botId} with plan ${this.pricingPlanReferenceCode}`);

    return new Promise((resolve, reject) => {
      this.iyzipay.subscriptionCheckoutForm.initialize(request, (err, result) => {
        if (err) {
          this.logger.error('Subscription checkout creation failed', err);
          reject(new BadRequestException('Payment initialization failed'));
        } else if (result.status === 'success') {
          this.logger.log(`Subscription checkout created: ${result.checkoutFormContent}`);
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
   */
  async retrieveSubscriptionCheckoutResult(token: string) {
    const request = {
      locale: Iyzipay.LOCALE.EN,
      token,
    };

    this.logger.log(`Retrieving subscription checkout result for token: ${token}`);

    return new Promise((resolve, reject) => {
      this.iyzipay.subscriptionCheckoutForm.retrieve(request, (err, result) => {
        if (err) {
          this.logger.error('Subscription checkout retrieval failed', err);
          reject(new BadRequestException('Subscription verification failed'));
        } else {
          this.logger.log(`Subscription status: ${result.data?.subscriptionStatus || 'UNKNOWN'}`);
          resolve(result);
        }
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
   */
  async processSuccessfulPayment(params: {
    botId: string;
    paymentId: string;
    cardToken?: string;
  }) {
    const { botId, paymentId, cardToken } = params;

    this.logger.log(`Processing successful payment for bot ${botId}`);

    // Update bot status to ACTIVE
    await this.prisma.chatbot.update({
      where: { id: botId },
      data: {
        status: 'ACTIVE',
        subscriptionId: paymentId,
        subscriptionStatus: 'active',
        // If we have card token, we can use it for future recurring charges
        // Store it securely in config
        ...(cardToken && {
          config: {
            ...(await this.prisma.chatbot
              .findUnique({ where: { id: botId } })
              .then((bot) => (bot?.config as any) || {})),
            cardToken,
          },
        }),
      },
    });

    this.logger.log(`Bot ${botId} activated successfully`);

    return { success: true };
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
   * Cancel subscription
   */
  async cancelSubscription(botId: string) {
    await this.prisma.chatbot.update({
      where: { id: botId },
      data: {
        status: 'PAUSED',
        subscriptionStatus: 'canceled',
      },
    });

    this.logger.log(`Subscription canceled for bot ${botId}`);

    return { success: true };
  }
}
