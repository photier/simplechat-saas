import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { N8NService } from '../n8n/n8n.service';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';
import { BotStatus, BotType } from '@prisma/client';
import { nanoid } from 'nanoid';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private prisma: PrismaService,
    private n8nService: N8NService,
  ) {}

  /**
   * Create a new chatbot (status: PENDING_PAYMENT)
   * N8N workflow will be created after payment
   */
  async create(tenantId: string, dto: CreateChatbotDto) {
    // Validate Telegram Group ID uniqueness (1 bot = 1 Telegram group)
    const telegramGroupId = dto.config?.telegramGroupId;
    const isProduction = process.env.NODE_ENV === 'production' && process.env.STRICT_TELEGRAM_VALIDATION === 'true';
    let existing = null; // Track conflicting bot for warning message

    if (telegramGroupId) {
      existing = await this.prisma.chatbot.findFirst({
        where: {
          status: { not: BotStatus.DELETED },
          config: {
            path: ['telegramGroupId'],
            equals: telegramGroupId,
          },
        },
        select: { id: true, name: true, chatId: true, tenantId: true },
      });

      if (existing) {
        // PRODUCTION MODE: Strict validation - no duplicate Telegram groups allowed
        if (isProduction) {
          throw new BadRequestException(
            `This Telegram Group is already in use by another bot. ` +
            `Each bot must have its own unique Telegram group. ` +
            `Please create a new Telegram group for this bot.`,
          );
        }

        // TEST/DEVELOPMENT MODE: Auto-deactivate conflicting bot + warning
        this.logger.warn(
          `[TEST MODE] Telegram Group ID ${telegramGroupId} conflict detected. ` +
          `Deactivating existing bot "${existing.name}" (${existing.chatId}) to allow new bot creation.`,
        );

        // Pause the conflicting bot
        await this.prisma.chatbot.update({
          where: { id: existing.id },
          data: { status: BotStatus.PAUSED },
        });

        this.logger.log(
          `[TEST MODE] Deactivated conflicting bot ${existing.chatId}. ` +
          `New bot will use Telegram Group ${telegramGroupId}`,
        );
      }
    }

    // Generate unique chatId and apiKey
    const chatId = `bot_${nanoid(10)}`;
    const apiKey = nanoid(32);

    // Default widget configuration
    const defaultConfig = {
      mainColor: dto.type === BotType.PREMIUM ? '#9F7AEA' : '#4c86f0',
      titleOpen: dto.type === BotType.PREMIUM ? '🤖 AI Bot (Premium)' : '🤖 AI Bot',
      titleClosed: 'Chat with us',
      introMessage: 'Hello! How can I help you today? ✨',
      placeholder: 'Type your message...',
      desktopHeight: 600,
      desktopWidth: 380,
      // Telegram config
      telegramMode: 'managed', // Use our @MySimpleChat_Bot (recommended)
      // TEMPORARY: Auto-set test Telegram group ID for development/testing
      // TODO: Remove this before production launch - users will provide their own Telegram groups
      telegramGroupId: '-1003440801039', // Test group for development
      ...dto.config, // Allow custom overrides (including telegramGroupId)
    };

    const chatbot = await this.prisma.chatbot.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        chatId,
        apiKey,
        status: BotStatus.PENDING_PAYMENT,
        config: defaultConfig,
      },
    });

    this.logger.log(`Chatbot created: ${chatbot.id} (${chatbot.name}) for tenant ${tenantId}`);

    // Build response with optional warning for test mode conflicts
    const response: any = {
      id: chatbot.id,
      name: chatbot.name,
      type: chatbot.type,
      chatId: chatbot.chatId,
      status: chatbot.status,
      config: chatbot.config,
      createdAt: chatbot.createdAt,
    };

    // Add warning if we deactivated a conflicting bot in test mode
    if (existing && !isProduction) {
      response.warning = {
        type: 'TELEGRAM_GROUP_CONFLICT',
        message: `⚠️ Test Mode: Automatically deactivated conflicting bot "${existing.name}" (${existing.chatId}) ` +
                 `that was using the same Telegram Group. In production, duplicate Telegram Groups will not be allowed.`,
        deactivatedBot: {
          name: existing.name,
          chatId: existing.chatId,
        },
      };
    }

    return response;
  }

  /**
   * List all chatbots for a tenant
   */
  async findAll(tenantId: string) {
    const chatbots = await this.prisma.chatbot.findMany({
      where: {
        tenantId,
        status: { not: BotStatus.DELETED }, // Exclude soft-deleted bots
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        type: true,
        chatId: true,
        status: true,
        config: true,
        webhookUrl: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return chatbots;
  }

  /**
   * Get single chatbot details
   */
  async findOne(tenantId: string, chatbotId: string) {
    const chatbot = await this.prisma.chatbot.findUnique({
      where: { id: chatbotId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
      },
    });

    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }

    // Verify ownership
    if (chatbot.tenantId !== tenantId) {
      throw new ForbiddenException('You do not have access to this chatbot');
    }

    if (chatbot.status === BotStatus.DELETED) {
      throw new NotFoundException('Chatbot has been deleted');
    }

    return chatbot;
  }

  /**
   * Update chatbot configuration
   */
  async update(tenantId: string, chatbotId: string, dto: UpdateChatbotDto) {
    // Verify ownership
    const chatbot = await this.findOne(tenantId, chatbotId);

    const updated = await this.prisma.chatbot.update({
      where: { id: chatbotId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.config && {
          config: {
            ...((chatbot.config as object) || {}),
            ...dto.config,
          },
        }),
      },
    });

    this.logger.log(`Chatbot updated: ${chatbotId}`);

    return updated;
  }

  /**
   * Soft delete chatbot
   */
  async remove(tenantId: string, chatbotId: string) {
    // Verify ownership
    await this.findOne(tenantId, chatbotId);

    await this.prisma.chatbot.update({
      where: { id: chatbotId },
      data: { status: BotStatus.DELETED },
    });

    this.logger.log(`Chatbot soft-deleted: ${chatbotId}`);

    return { success: true, message: 'Chatbot deleted successfully' };
  }

  /**
   * Purchase bot (dummy payment for now)
   * This will:
   * 1. Clone N8N workflow
   * 2. Activate the bot
   * 3. Set trial period
   */
  async purchase(tenantId: string, chatbotId: string) {
    // Verify ownership and get bot
    const chatbot = await this.findOne(tenantId, chatbotId);

    // Check if already purchased
    if (chatbot.status === BotStatus.ACTIVE) {
      throw new BadRequestException('Chatbot is already active');
    }

    if (chatbot.status !== BotStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Chatbot cannot be purchased in current state');
    }

    this.logger.log(`Processing purchase for chatbot ${chatbotId}`);

    // 1. Clone N8N workflow with bot configuration
    let workflowInfo;
    try {
      // Extract configuration from chatbot.config
      const botConfig = chatbot.config as any;

      workflowInfo = await this.n8nService.cloneWorkflowForChatbot(
        chatbot.id,
        chatbot.chatId,
        chatbot.tenantId,
        chatbot.type as 'BASIC' | 'PREMIUM',
        {
          websiteUrl: botConfig?.websiteUrl,
          description: botConfig?.description,
          aiInstructions: botConfig?.aiInstructions,
          telegramMode: botConfig?.telegramMode,
          telegramGroupId: botConfig?.telegramGroupId,
          telegramBotToken: botConfig?.telegramBotToken,
        },
      );

      this.logger.log(
        `N8N workflow created for chatbot ${chatbotId}: ${workflowInfo.workflowId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create N8N workflow for chatbot ${chatbotId}`,
        error.message,
      );
      throw new BadRequestException(
        'Failed to provision chatbot. Please try again or contact support.',
      );
    }

    // 2. Calculate trial end date (7 days)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // 3. Update chatbot status
    const updatedChatbot = await this.prisma.chatbot.update({
      where: { id: chatbotId },
      data: {
        status: BotStatus.ACTIVE,
        n8nWorkflowId: workflowInfo.workflowId,
        n8nWorkflowName: workflowInfo.workflowName,
        webhookUrl: workflowInfo.webhookUrl,
        subscriptionStatus: 'trialing',
        trialEndsAt,
      },
    });

    this.logger.log(`Chatbot activated successfully: ${chatbotId}`);

    return {
      success: true,
      chatbot: {
        id: updatedChatbot.id,
        name: updatedChatbot.name,
        type: updatedChatbot.type,
        chatId: updatedChatbot.chatId,
        status: updatedChatbot.status,
        webhookUrl: updatedChatbot.webhookUrl,
        trialEndsAt: updatedChatbot.trialEndsAt,
        embedCode: this.generateEmbedCode(updatedChatbot),
      },
    };
  }

  /**
   * Generate embed code for a chatbot
   */
  private generateEmbedCode(chatbot: any): string {
    const isPremium = chatbot.type === BotType.PREMIUM;
    // Tenant bots use chatId-based subdomains (*.w.simplechat.bot or *.p.simplechat.bot)
    const host = isPremium
      ? `https://${chatbot.chatId}.p.simplechat.bot`
      : `https://${chatbot.chatId}.w.simplechat.bot`;
    const prefix = isPremium ? 'P-Guest-' : 'W-Guest-';

    return `<script>
(function() {
  window.simpleChatConfig = {
    chatId: "${chatbot.chatId}",
    userId: "${prefix}" + Math.random().toString(36).substr(2, 9),
    apiKey: "${chatbot.apiKey}",
    host: "${host}"
    // All configuration is loaded from database via /api/widget-config
  };

  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = '${host}/css/simple-chat${isPremium ? '-premium' : ''}.css?v=' + Date.now();
  document.head.appendChild(css);

  var js = document.createElement('script');
  js.src = '${host}/js/simple-chat${isPremium ? '-premium' : ''}.min.js?v=' + Date.now();
  js.async = true;
  document.body.appendChild(js);
})();
</script>`;
  }

  /**
   * Get embed code for active chatbot
   */
  async getEmbedCode(tenantId: string, chatbotId: string) {
    const chatbot = await this.findOne(tenantId, chatbotId);

    if (chatbot.status !== BotStatus.ACTIVE) {
      throw new BadRequestException('Chatbot must be active to get embed code');
    }

    return {
      embedCode: this.generateEmbedCode(chatbot),
      chatId: chatbot.chatId,
      webhookUrl: chatbot.webhookUrl,
    };
  }

  /**
   * Get chatbot config by chatId (PUBLIC - no authentication)
   * Used by tenant widgets to fetch their configuration
   */
  async getConfigByChatId(chatId: string) {
    // Case-insensitive search (subdomains are often lowercase)
    const chatbot = await this.prisma.chatbot.findFirst({
      where: {
        chatId: {
          equals: chatId,
          mode: 'insensitive',
        }
      },
      select: {
        id: true,
        chatId: true,
        name: true,
        type: true,
        status: true,
        config: true,
      },
    });

    if (!chatbot) {
      throw new NotFoundException('Chatbot not found');
    }

    if (chatbot.status === BotStatus.DELETED) {
      throw new NotFoundException('Chatbot has been deleted');
    }

    // Return config with defaults merged
    const defaultConfig = {
      mainColor: chatbot.type === BotType.PREMIUM ? '#9F7AEA' : '#4c86f0',
      titleOpen: chatbot.type === BotType.PREMIUM ? '🤖 AI Bot (Premium)' : '🤖 AI Bot',
      titleClosed: 'Chat with us',
      introMessage: 'Hello! How can I help you today? ✨',
      placeholder: 'Type your message...',
      desktopHeight: 600,
      desktopWidth: 380,
    };

    return {
      success: true,
      chatId: chatbot.chatId,
      name: chatbot.name,
      type: chatbot.type,
      config: {
        ...defaultConfig,
        ...(chatbot.config as object || {}),
      },
    };
  }
}
