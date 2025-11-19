import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
const Iyzipay = require('iyzipay');

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private iyzipay: any;

  constructor(private prisma: PrismaService) {
    try {
      // Initialize Iyzico client (Checkout Form API)
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
        this.logger.log('✅ Iyzico Checkout Form Service initialized (Sandbox Mode)');
      } else {
        this.logger.warn('⚠️  Iyzico API keys not found - Payment service disabled');
      }
    } catch (error) {
      this.logger.error('❌ Failed to initialize Iyzico service', error);
      // Don't throw - allow app to start even if payment service fails
    }
  }

  /**
   * Create Iyzico Checkout Form for subscription
   * Iyzico handles everything: card input, 3DS, validation
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

    const { tenantId, botId, botName, email, fullName, phone } = params;

    // Get tenant info
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    // Callback URL for after payment (backend API endpoint)
    // Iyzico will POST to this endpoint with payment result
    const backendUrl = process.env.BACKEND_URL || 'https://api.simplechat.bot';
    const callbackUrl = `${backendUrl}/payment/callback?botId=${botId}`;

    const conversationId = `bot-${botId}-${Date.now()}`;

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price: '9.99',
      paidPrice: '9.99',
      currency: Iyzipay.CURRENCY.TRY,
      basketId: botId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
      callbackUrl,
      enabledInstallments: [1], // Tek çekim, taksit yok
      buyer: {
        id: tenantId,
        name: fullName.split(' ')[0] || 'User',
        surname: fullName.split(' ').slice(1).join(' ') || 'User',
        gsmNumber: phone || '+905000000000',
        email,
        identityNumber: '11111111111', // Test için placeholder
        registrationAddress: 'Istanbul, Turkey',
        ip: '85.34.78.112',
        city: 'Istanbul',
        country: 'Turkey',
      },
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
      basketItems: [
        {
          id: 'BASIC-PLAN',
          name: `SimpleChat Bot - ${botName}`,
          category1: 'Subscription',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: '9.99',
        },
      ],
    };

    this.logger.log(`Creating subscription checkout for bot ${botId}`);

    return new Promise((resolve, reject) => {
      this.iyzipay.checkoutFormInitialize.create(request, (err, result) => {
        if (err) {
          this.logger.error('Checkout form creation failed', err);
          reject(new BadRequestException('Payment initialization failed'));
        } else if (result.status === 'success') {
          this.logger.log(
            `Checkout form created: ${result.checkoutFormContent}`,
          );
          resolve({
            token: result.token,
            checkoutFormContent: result.checkoutFormContent,
            paymentPageUrl: result.paymentPageUrl,
          });
        } else {
          this.logger.error('Checkout form error', result);
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
   * Retrieve checkout form result after payment
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
