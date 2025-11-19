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
import { Request, Response } from 'express';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

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
   * GET /payment/callback?token=xxx&botId=xxx
   */
  @Get('callback')
  async handleCallback(
    @Query('token') token: string,
    @Query('botId') botId: string,
    @Res() res: Response,
  ) {
    this.logger.log(`Payment callback received for bot ${botId}`);

    try {
      const result: any =
        await this.paymentService.retrieveCheckoutFormResult(token);

      if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
        // Payment successful
        this.logger.log(`Payment successful for bot ${botId}`);

        await this.paymentService.processSuccessfulPayment({
          botId,
          paymentId: result.paymentId,
          cardToken: result.cardToken,
        });

        // Redirect to success page
        return res.redirect(
          `${process.env.FRONTEND_URL || 'https://login.simplechat.bot'}/payment/success?botId=${botId}`,
        );
      } else {
        // Payment failed
        this.logger.error(`Payment failed for bot ${botId}`, result);

        return res.redirect(
          `${process.env.FRONTEND_URL || 'https://login.simplechat.bot'}/payment/failure?reason=${result.errorMessage || 'Payment failed'}`,
        );
      }
    } catch (error) {
      this.logger.error('Payment callback error', error);
      return res.redirect(
        `${process.env.FRONTEND_URL || 'https://login.simplechat.bot'}/payment/failure?reason=Verification failed`,
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
