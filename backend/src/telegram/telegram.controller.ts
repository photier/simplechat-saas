import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  private readonly logger = new Logger(TelegramController.name);

  constructor(private telegramService: TelegramService) {}

  /**
   * Telegram Webhook Endpoint
   * This receives ALL messages from @MySimpleChat_Bot
   * and routes them to the correct chatbot's N8N workflow
   */
  @Post('webhook')
  async handleWebhook(@Body() update: any) {
    this.logger.log(
      `Received Telegram webhook - Update ID: ${update.update_id}`,
    );

    // Route the message to the appropriate chatbot
    const result = await this.telegramService.routeMessage(update);

    // Telegram expects a quick 200 OK response
    // We don't wait for N8N processing to complete
    return { ok: true };
  }

  /**
   * Debug endpoint - Get current webhook info
   * GET /telegram/webhook-info
   */
  @Get('webhook-info')
  async getWebhookInfo() {
    return await this.telegramService.getWebhookInfo();
  }

  /**
   * Setup endpoint - Set webhook URL (run once)
   * POST /telegram/setup-webhook
   * Body: { url: "https://api.simplechat.bot/telegram/webhook" }
   */
  @Post('setup-webhook')
  async setupWebhook(@Body('url') url: string) {
    if (!url) {
      return {
        ok: false,
        error: 'URL is required in request body',
      };
    }

    return await this.telegramService.setWebhook(url);
  }
}
