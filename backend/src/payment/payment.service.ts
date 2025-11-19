import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Iyzipay from 'iyzipay';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private iyzipay: any;

  constructor(private prisma: PrismaService) {
    // Initialize Iyzico client
    this.iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY,
      secretKey: process.env.IYZICO_SECRET_KEY,
      uri: process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com', // Use sandbox for testing
    });

    this.logger.log('Iyzico Payment Service initialized');
  }

  /**
   * Create Checkout Form for BASIC bot subscription
   * Returns checkout form HTML/token that can be displayed in an iframe
   */
  async createCheckoutForm(params: {
    tenantId: string;
    botId: string;
    botName: string;
    email: string;
    fullName: string;
    callbackUrl: string;
  }) {
    const { tenantId, botId, botName, email, fullName, callbackUrl } = params;

    // Get tenant info
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    // Generate unique conversation ID for this payment
    const conversationId = `bot-${botId}-${Date.now()}`;

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price: '9.99', // BASIC plan price
      paidPrice: '9.99',
      currency: Iyzipay.CURRENCY.TRY,
      basketId: botId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
      callbackUrl, // Where to redirect after payment
      enabledInstallments: [1], // Only single payment, no installments
      buyer: {
        id: tenantId,
        name: fullName.split(' ')[0] || 'User',
        surname: fullName.split(' ').slice(1).join(' ') || 'User',
        gsmNumber: '+905350000000', // Placeholder, can be optional
        email,
        identityNumber: '11111111111', // Placeholder TC no
        registrationAddress: 'Türkiye',
        ip: '85.34.78.112', // We'll get this from request in controller
        city: 'Istanbul',
        country: 'Turkey',
      },
      shippingAddress: {
        contactName: fullName,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Türkiye',
      },
      billingAddress: {
        contactName: fullName,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Türkiye',
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

    this.logger.log(`Creating checkout form for bot ${botId}`);

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
   * This would be called by a cron job or Iyzico webhook
   */
  async chargeMonthlySubscription(botId: string) {
    const bot = await this.prisma.chatbot.findUnique({
      where: { id: botId },
    });

    if (!bot || bot.status !== 'ACTIVE') {
      throw new BadRequestException('Bot not active');
    }

    // TODO: Implement recurring charge logic
    // This requires storing card token and using it for subsequent charges
    this.logger.warn('Recurring charge not yet implemented');

    return { success: false, message: 'Not implemented yet' };
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
