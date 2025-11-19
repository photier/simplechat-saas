import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import type { Response } from 'express';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create Iyzico checkout form for bot subscription
   * POST /payment/checkout
   */
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(@Req() req: any, @Body() body: any) {
    const tenantId = req.user.id;
    const { botId, botName } = body;

    this.logger.log(`Creating subscription checkout for bot ${botId}`);

    const result = await this.paymentService.createSubscriptionCheckout({
      tenantId,
      botId,
      botName,
      email: req.user.email,
      fullName: req.user.fullName || req.user.name || 'User',
      phone: req.user.phone,
    });

    return result;
  }

  /**
   * Handle payment callback from Iyzico
   * POST /payment/callback (Iyzico sends POST request with token in body)
   */
  @Post('callback')
  async handleCallback(
    @Body('token') token: string,
    @Res() res: Response,
  ) {
    this.logger.log(`Payment callback received with token: ${token}`);

    try {
      // Retrieve payment result from Iyzico
      const result: any =
        await this.paymentService.retrieveCheckoutFormResult(token);

      // Extract botId from basketId (we stored botId as basketId)
      const botId = result.basketId;

      if (!botId) {
        this.logger.error('No botId found in payment result');
        return res.redirect(
          `https://login.simplechat.bot/payment/failure?reason=Invalid payment data`,
        );
      }

      // Get bot and tenant info for redirect URL
      const bot = await this.prisma.chatbot.findUnique({
        where: { id: botId },
        include: { tenant: true },
      });

      if (!bot || !bot.tenant) {
        this.logger.error(`Bot or tenant not found for botId: ${botId}`);
        return res.redirect(
          `https://login.simplechat.bot/payment/failure?reason=Bot not found`,
        );
      }

      const tenantUrl = `https://${bot.tenant.subdomain}.simplechat.bot`;

      if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
        // Payment successful
        this.logger.log(`Payment successful for bot ${botId}`);

        await this.paymentService.processSuccessfulPayment({
          botId,
          paymentId: result.paymentId,
          cardToken: result.cardToken,
        });

        // Redirect to tenant-specific success page
        return res.redirect(`${tenantUrl}/payment/success?botId=${botId}`);
      } else {
        // Payment failed
        this.logger.error(`Payment failed for bot ${botId}`, result);

        return res.redirect(
          `${tenantUrl}/payment/failure?reason=${result.errorMessage || 'Payment failed'}`,
        );
      }
    } catch (error) {
      this.logger.error('Payment callback error', error);
      return res.redirect(
        `https://login.simplechat.bot/payment/failure?reason=Verification failed`,
      );
    }
  }

  /**
   * Handle subscription payment callback from Iyzico
   * POST /payment/subscription-callback (Iyzico sends POST request with token in body)
   */
  @Post('subscription-callback')
  async handleSubscriptionCallback(
    @Body('token') token: string,
    @Res() res: Response,
  ) {
    this.logger.log(`Subscription callback received with token: ${token}`);

    try {
      // Retrieve subscription result from Iyzico
      const result: any =
        await this.paymentService.retrieveSubscriptionCheckoutResult(token);

      // Extract botId from conversationId (format: bot-{botId}-{timestamp})
      const conversationId = result.conversationId || '';
      const botIdMatch = conversationId.match(/^bot-([a-f0-9-]+)-\d+$/);
      const botId = botIdMatch ? botIdMatch[1] : null;

      if (!botId) {
        this.logger.error('No botId found in subscription result conversationId:', conversationId);
        return res.redirect(
          `https://login.simplechat.bot/payment/failure?reason=Invalid subscription data`,
        );
      }

      // Get bot and tenant info for redirect URL
      const bot = await this.prisma.chatbot.findUnique({
        where: { id: botId },
        include: { tenant: true },
      });

      if (!bot || !bot.tenant) {
        this.logger.error(`Bot or tenant not found for botId: ${botId}`);
        return res.redirect(
          `https://login.simplechat.bot/payment/failure?reason=Bot not found`,
        );
      }

      const tenantUrl = `https://${bot.tenant.subdomain}.simplechat.bot`;

      if (result.status === 'success' && result.data?.subscriptionStatus === 'ACTIVE') {
        // Subscription successful
        this.logger.log(`Subscription successful for bot ${botId}`);

        await this.paymentService.processSuccessfulPayment({
          botId,
          paymentId: result.data.referenceCode, // Subscription reference code
          cardToken: result.data.cardToken,
        });

        // Redirect to tenant-specific success page
        return res.redirect(`${tenantUrl}/payment/success?botId=${botId}`);
      } else {
        // Subscription failed
        this.logger.error(`Subscription failed for bot ${botId}`, result);

        return res.redirect(
          `${tenantUrl}/payment/failure?reason=${result.errorMessage || 'Subscription failed'}`,
        );
      }
    } catch (error) {
      this.logger.error('Subscription callback error', error);
      return res.redirect(
        `https://login.simplechat.bot/payment/failure?reason=Verification failed`,
      );
    }
  }

  /**
   * Iyzico webhook endpoint
   * POST /payment/webhook
   * (For future recurring payment notifications)
   */
  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    this.logger.log('Iyzico webhook received', body);

    // TODO: Implement webhook handling for recurring payments
    // Verify webhook signature
    // Process payment notifications
    // Update subscription status

    return { received: true };
  }

  /**
   * Setup endpoints (one-time use)
   * POST /payment/setup/product
   */
  @Post('setup/product')
  @UseGuards(JwtAuthGuard)
  async setupProduct(@Req() req: any) {
    this.logger.log('Creating subscription product...');
    const result = await this.paymentService.createSubscriptionProduct();
    return result;
  }

  /**
   * POST /payment/setup/plan
   */
  @Post('setup/plan')
  @UseGuards(JwtAuthGuard)
  async setupPlan(@Req() req: any, @Body() body: { productReferenceCode: string }) {
    this.logger.log(`Creating pricing plan for product ${body.productReferenceCode}...`);
    const result = await this.paymentService.createPricingPlan(body.productReferenceCode);
    return result;
  }

  /**
   * Cancel subscription
   * POST /payment/cancel
   */
  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(@Req() req: any, @Body() body: any) {
    const { botId } = body;

    this.logger.log(`Canceling subscription for bot ${botId}`);

    const result = await this.paymentService.cancelSubscription(botId);

    return result;
  }
}
