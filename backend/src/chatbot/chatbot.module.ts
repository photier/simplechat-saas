import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { N8NModule } from '../n8n/n8n.module';

@Module({
  imports: [PrismaModule, N8NModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
