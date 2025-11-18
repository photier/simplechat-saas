import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { UpdateChatbotDto } from './dto/update-chatbot.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chatbots')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  /**
   * POST /chatbots - Create new chatbot
   */
  @Post()
  async create(@Request() req, @Body() createChatbotDto: CreateChatbotDto) {
    const tenantId = req.user.id; // From validated tenant object
    return this.chatbotService.create(tenantId, createChatbotDto);
  }

  /**
   * GET /chatbots - List all chatbots for authenticated tenant
   */
  @Get()
  async findAll(@Request() req) {
    const tenantId = req.user.id;
    return this.chatbotService.findAll(tenantId);
  }

  /**
   * GET /chatbots/:id - Get single chatbot details
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.id;
    return this.chatbotService.findOne(tenantId, id);
  }

  /**
   * PATCH /chatbots/:id - Update chatbot configuration
   */
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateChatbotDto: UpdateChatbotDto,
  ) {
    const tenantId = req.user.id;
    return this.chatbotService.update(tenantId, id, updateChatbotDto);
  }

  /**
   * DELETE /chatbots/:id - Soft delete chatbot
   */
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.id;
    return this.chatbotService.remove(tenantId, id);
  }

  /**
   * POST /chatbots/:id/purchase - Purchase bot (dummy payment)
   */
  @Post(':id/purchase')
  async purchase(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.id;
    return this.chatbotService.purchase(tenantId, id);
  }

  /**
   * GET /chatbots/:id/embed - Get embed code for active bot
   */
  @Get(':id/embed')
  async getEmbedCode(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.id;
    return this.chatbotService.getEmbedCode(tenantId, id);
  }
}

/**
 * Public endpoints (no authentication required)
 * Used by tenant widgets to fetch configuration
 */
@Controller('public/chatbot')
export class PublicChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  /**
   * GET /public/chatbot/:chatId/config - Get bot config by chatId (public)
   * Used by tenant widgets to fetch their configuration from database
   */
  @Get(':chatId/config')
  async getConfigByChatId(@Param('chatId') chatId: string) {
    return this.chatbotService.getConfigByChatId(chatId);
  }

  @Get(':chatId/messages')
  async getMessagesByChatId(@Param('chatId') chatId: string) {
    return this.chatbotService.getMessagesByChatId(chatId);
  }
}
