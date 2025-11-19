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
        // Payment failed - mark bot as failed
        await this.prisma.chatbot.update({
          where: { id: botId },
          data: {
            subscriptionStatus: 'failed',
            updatedAt: new Date(),
          },
        });

        this.logger.error(`Payment failed for bot ${botId} - marked as failed`, result);

        return res.redirect(
          `${tenantUrl}/payment/failure?reason=${result.errorMessage || 'Payment failed'}`,
        );
      }
    } catch (error) {
      this.logger.error('Payment callback error', error);

      // Try to extract botId from basketId and mark as failed if possible
      try {
        const basketId = (error as any).basketId;
        if (basketId) {
          await this.prisma.chatbot.update({
            where: { id: basketId },
            data: {
              subscriptionStatus: 'failed',
              updatedAt: new Date(),
            },
          });
          this.logger.log(`Marked bot ${basketId} as failed after error`);
        }
      } catch (updateError) {
        this.logger.error('Failed to mark bot as failed', updateError);
      }

      return res.redirect(
        `https://login.simplechat.bot/payment/failure?reason=Verification failed`,
      );
    }
  }

  /**
   * Handle subscription payment callback from Iyzico (SYNCHRONOUS)
   * POST /payment/subscription-callback (Iyzico sends POST request with token in body)
   *
   * IMPORTANT: This is NOT a webhook - it's a browser redirect that happens immediately
   * after payment form submission. We should NOT query Iyzico status here because their
   * system needs 10-15 seconds to finalize. Instead, we redirect to a "processing" page
   * and let the webhook (which arrives 10-15 sec later) update the actual status.
   */
  @Post('subscription-callback')
  async handleSubscriptionCallback(
    @Body('token') token: string,
    @Res() res: Response,
  ) {
    this.logger.log(`Subscription callback received with token: ${token}`);

    try {
      // Look up botId from our database using the token
      const paymentToken = await this.prisma.paymentToken.findUnique({
        where: { token },
      });

      if (!paymentToken) {
        this.logger.error(`Payment token not found in database: ${token}`);
        return res.redirect(
          `https://login.simplechat.bot/payment/failure?reason=Invalid payment token`,
        );
      }

      const botId = paymentToken.botId;
      this.logger.log(`Found botId from token: ${botId}`);

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

      // Mark bot as "processing" - webhook will update to ACTIVE or failed
      await this.prisma.chatbot.update({
        where: { id: botId },
        data: {
          subscriptionStatus: 'processing',
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Bot ${botId} marked as processing - webhook will finalize status`);

      // Redirect to processing page - frontend will poll for status
      // The webhook (arriving 10-15 seconds later) will update the actual status
      return res.redirect(`${tenantUrl}/payment/processing?botId=${botId}`);
    } catch (error) {
      this.logger.error('Subscription callback error', error);

      // Try to look up botId from token
      try {
        const paymentToken = await this.prisma.paymentToken.findUnique({
          where: { token },
        });

        if (paymentToken) {
          const botId = paymentToken.botId;
          const bot = await this.prisma.chatbot.findUnique({
            where: { id: botId },
            include: { tenant: true },
          });

          if (bot?.tenant) {
            return res.redirect(
              `https://${bot.tenant.subdomain}.simplechat.bot/payment/failure?reason=System error`,
            );
          }
        }
      } catch (updateError) {
        this.logger.error('Failed to get bot for redirect', updateError);
      }

      return res.redirect(
        `https://login.simplechat.bot/payment/failure?reason=System error`,
      );
    }
  }

  /**
   * Iyzico subscription webhook endpoint (ASYNCHRONOUS)
   * POST /payment/webhook
   *
   * This is the REAL status notification that arrives 10-15 seconds after payment
   * Industry standard: Async webhook that processes payment status in background
   *
   * Webhook URL: https://api.simplechat.bot/payment/webhook
   * Configure in Iyzico Merchant Panel: Settings → Merchant Notifications
   *
   * Events:
   * - subscription.order.success
   * - subscription.order.failure
   */
  @Post('webhook')
  async handleWebhook(
    @Body() body: any,
    @Req() req: any,
  ) {
    this.logger.log(`Iyzico webhook received: ${JSON.stringify(body)}`);

    try {
      // Extract webhook data
      const {
        iyziEventType,
        subscriptionReferenceCode,
        orderReferenceCode,
        customerReferenceCode,
        iyziReferenceCode,
      } = body;

      // Get signature from header
      const receivedSignature = req.headers['x-iyz-signature-v3'];

      if (!receivedSignature) {
        this.logger.error('Missing X-IYZ-SIGNATURE-V3 header');
        return { received: false, error: 'Missing signature' };
      }

      // Verify webhook signature (security check)
      const isValid = await this.paymentService.verifyWebhookSignature({
        eventType: iyziEventType,
        subscriptionReferenceCode,
        orderReferenceCode,
        customerReferenceCode,
        receivedSignature,
      });

      if (!isValid) {
        this.logger.error('Invalid webhook signature - possible security breach');
        return { received: false, error: 'Invalid signature' };
      }

      this.logger.log(`✅ Webhook signature verified for event: ${iyziEventType}`);

      // Find bot by subscription reference code
      const bot = await this.prisma.chatbot.findFirst({
        where: { subscriptionId: subscriptionReferenceCode },
      });

      // If bot not found by subscriptionId, try to match by recent processing status
      // (first payment won't have subscriptionId yet)
      let botToUpdate = bot;
      if (!bot) {
        botToUpdate = await this.prisma.chatbot.findFirst({
          where: { subscriptionStatus: 'processing' },
          orderBy: { updatedAt: 'desc' },
        });
      }

      if (!botToUpdate) {
        this.logger.error(`No bot found for subscription: ${subscriptionReferenceCode}`);
        return { received: true }; // Return 200 to stop Iyzico retries
      }

      // Process based on event type
      if (iyziEventType === 'subscription.order.success') {
        // Payment successful
        this.logger.log(`✅ Subscription payment successful for bot ${botToUpdate.id}`);

        await this.paymentService.processSuccessfulPayment({
          botId: botToUpdate.id,
          paymentId: subscriptionReferenceCode,
        });

        this.logger.log(`Bot ${botToUpdate.id} activated successfully via webhook`);
      } else if (iyziEventType === 'subscription.order.failure') {
        // Payment failed
        this.logger.log(`❌ Subscription payment failed for bot ${botToUpdate.id}`);

        await this.prisma.chatbot.update({
          where: { id: botToUpdate.id },
          data: {
            status: 'PAUSED',
            subscriptionStatus: 'failed',
            updatedAt: new Date(),
          },
        });

        this.logger.log(`Bot ${botToUpdate.id} marked as failed via webhook`);
      }

      // Always return 200 to acknowledge receipt (stops Iyzico retries)
      return { received: true };
    } catch (error) {
      this.logger.error('Webhook processing error', error);

      // Return 200 even on error to avoid infinite retries
      // Log the error for manual investigation
      return { received: true, error: 'Processing error - check logs' };
    }
  }

  /**
   * Setup endpoints (one-time use)
   * POST /payment/setup/product
   * NOTE: Requires subscription API to be enabled by Iyzico support
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
   * NOTE: Requires subscription API to be enabled by Iyzico support
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
