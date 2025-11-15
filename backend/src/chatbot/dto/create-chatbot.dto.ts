import { IsString, IsEnum, MinLength, IsOptional, IsObject } from 'class-validator';
import { BotType } from '@prisma/client';

export class CreateChatbotDto {
  @IsString()
  @MinLength(2, { message: 'Bot name must be at least 2 characters' })
  name: string;

  @IsEnum(BotType)
  type: BotType; // BASIC or PREMIUM

  @IsOptional()
  @IsObject()
  config?: {
    mainColor?: string;
    titleOpen?: string;
    titleClosed?: string;
    introMessage?: string;
    placeholder?: string;
    desktopHeight?: number;
    desktopWidth?: number;
    // Telegram Integration (required for production)
    telegramMode?: 'managed' | 'custom';
    telegramGroupId?: string;
    telegramBotToken?: string;
    // AI Configuration
    websiteUrl?: string;
    description?: string;
    aiInstructions?: string;
  };
}
