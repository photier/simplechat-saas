import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      title?: string;
    };
    date: number;
    text?: string;
    message_thread_id?: number;
  };
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Route incoming Telegram message to the correct N8N workflow
   * This is the ROUTER that enables multi-tenant with a single Telegram bot
   */
  async routeMessage(update: TelegramUpdate) {
    try {
      // 1. Extract chat ID from Telegram update
      const telegramChatId = update.message?.chat?.id?.toString();

      if (!telegramChatId) {
        this.logger.warn('Received Telegram update without chat ID');
        return { ok: false, error: 'No chat ID in update' };
      }

      this.logger.log(`Routing Telegram message from group ${telegramChatId}`);

      // 2. Find chatbot by telegramGroupId
      // Production rule: 1 bot = 1 Telegram group (strict isolation)
      // Test mode: Multiple bots can share same group - use newest active paid bot
      const chatbot = await this.prisma.$queryRaw<any[]>`
        SELECT id, "chatId", "n8nWorkflowId", name
        FROM saas."Chatbot"
        WHERE config->>'telegramGroupId' = ${telegramChatId}
          AND status = 'ACTIVE'
          AND "subscriptionStatus" IN ('active', 'trialing')
          AND "n8nWorkflowId" IS NOT NULL
        ORDER BY "createdAt" DESC
        LIMIT 1
      `;

      if (!chatbot || chatbot.length === 0) {
        this.logger.warn(
          `No active chatbot found for Telegram group ${telegramChatId}`,
        );
        return {
          ok: false,
          error: `No chatbot configured for this Telegram group`,
        };
      }

      const bot = chatbot[0];
      this.logger.log(
        `Found chatbot: ${bot.name} (${bot.chatId}) - Workflow: ${bot.n8nWorkflowId}`,
      );

      // 3. Forward message to chatbot's N8N webhook
      const n8nWebhookUrl = `${process.env.N8N_BASE_URL}/webhook/${bot.chatId}`;

      this.logger.log(`Forwarding to N8N webhook: ${n8nWebhookUrl}`);

      const response = await axios.post(n8nWebhookUrl, update, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(
        `Successfully routed message to chatbot ${bot.chatId}`,
      );

      return {
        ok: true,
        chatbot: {
          id: bot.id,
          name: bot.name,
          chatId: bot.chatId,
        },
        n8nResponse: response.status,
      };
    } catch (error) {
      this.logger.error(
        `Failed to route Telegram message: ${error.message}`,
        error.stack,
      );

      return {
        ok: false,
        error: error.message,
      };
    }
  }

  /**
   * Get webhook info for debugging
   */
  async getWebhookInfo() {
    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getWebhookInfo`,
      );

      return response.data.result;
    } catch (error) {
      this.logger.error(`Failed to get webhook info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set webhook URL (run once during setup)
   */
  async setWebhook(webhookUrl: string) {
    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`,
        {
          url: webhookUrl,
          allowed_updates: ['message'],
          drop_pending_updates: false,
        },
      );

      this.logger.log(
        `Telegram webhook set to: ${webhookUrl}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to set webhook: ${error.message}`);
      throw error;
    }
  }
}
