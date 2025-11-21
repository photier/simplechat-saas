import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from '../prisma/prisma.service';
import { N8NModule } from '../n8n/n8n.module';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  imports: [N8NModule, TelegramModule],
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService],
  exports: [PaymentService],
})
export class PaymentModule {}
