import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { N8NService } from '../n8n/n8n.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private n8nService: N8NService,
  ) {}

  /**
   * Check for expired subscriptions every day at 2 AM
   * Deactivates bots whose subscriptionEndsAt has passed OR trial expired
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleExpiredSubscriptions() {
    this.logger.log('⏰ Running daily subscription expiry check...');

    const now = new Date();

    try {
      // 1. Find bots with expired trials (7 days from creation)
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const expiredTrials = await this.prisma.chatbot.findMany({
        where: {
          status: 'ACTIVE',
          type: 'BASIC', // Only BASIC has 7-day trial
          subscriptionStatus: 'trialing',
          createdAt: {
            lte: sevenDaysAgo, // Created 7+ days ago
          },
        },
        select: {
          id: true,
          chatId: true,
          name: true,
          n8nWorkflowId: true,
          createdAt: true,
          tenant: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      });

      // 2. Find bots with expired subscriptions (after cancellation)
      const expiredSubscriptions = await this.prisma.chatbot.findMany({
        where: {
          status: 'ACTIVE',
          subscriptionStatus: 'canceled',
          subscriptionEndsAt: {
            lte: now, // Less than or equal to now
          },
        },
        select: {
          id: true,
          chatId: true,
          name: true,
          n8nWorkflowId: true,
          subscriptionEndsAt: true,
          tenant: {
            select: {
              email: true,
              fullName: true,
            },
          },
        },
      });

      const allExpiredBots = [...expiredTrials, ...expiredSubscriptions];

      if (allExpiredBots.length === 0) {
        this.logger.log('✓ No expired subscriptions or trials found');
        return;
      }

      this.logger.log(
        `Found ${expiredTrials.length} expired trial(s) and ${expiredSubscriptions.length} expired subscription(s), deactivating...`
      );

      for (const bot of allExpiredBots) {
        try {
          const isTrial = expiredTrials.some((t) => t.id === bot.id);
          const reason = isTrial
            ? `trial ended on ${new Date(bot.createdAt).toISOString()}`
            : `subscription expired on ${bot.subscriptionEndsAt?.toISOString()}`;

          // 1. Deactivate N8N workflow if exists
          if (bot.n8nWorkflowId) {
            this.logger.log(
              `Deactivating N8N workflow ${bot.n8nWorkflowId} for bot ${bot.chatId} - ${reason}`
            );
            await this.n8nService.deactivateWorkflow(bot.n8nWorkflowId);
          }

          // 2. Update bot status to PAUSED
          await this.prisma.chatbot.update({
            where: { id: bot.id },
            data: {
              status: 'PAUSED',
              subscriptionStatus: 'expired',
            },
          });

          // 3. TODO: Send email notification
          if (bot.tenant?.email) {
            this.logger.log(
              `TODO: Send email to ${bot.tenant.email} about bot ${bot.chatId} deactivation`
            );
          }

          this.logger.log(
            `✅ Deactivated bot ${bot.chatId} (${bot.name}) - ${reason}`
          );
        } catch (error) {
          this.logger.error(
            `Failed to deactivate bot ${bot.chatId}: ${error.message}`,
            error.stack
          );
          // Continue with other bots even if one fails
        }
      }

      this.logger.log(
        `✓ Completed expiry check - ${allExpiredBots.length} bot(s) deactivated`
      );
    } catch (error) {
      this.logger.error(
        `Error in subscription expiry check: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * Manual trigger for testing (can call via endpoint)
   */
  async checkExpiredSubscriptionsNow() {
    this.logger.log('⚡ Manual trigger - checking expired subscriptions...');
    await this.handleExpiredSubscriptions();
  }
}
