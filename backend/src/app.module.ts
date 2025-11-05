import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TenantModule } from './tenant/tenant.module';

@Module({
  imports: [PrismaModule, TenantModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
