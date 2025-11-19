import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './tenant/tenant.module';
import { AuthModule } from './auth/auth.module';
import { N8NModule } from './n8n/n8n.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { TelegramModule } from './telegram/telegram.module';
import { StatsModule } from './stats/stats.module';
// import { PaymentModule } from './payment/payment.module'; // TEMPORARILY DISABLED FOR DEBUGGING

@Module({
  imports: [
    PrismaModule,
    TenantModule,
    AuthModule,
    N8NModule,
    ChatbotModule,
    TelegramModule,
    StatsModule,
    // PaymentModule, // TEMPORARILY DISABLED FOR DEBUGGING
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
