import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { N8NModule } from '../n8n/n8n.module';

@Module({
  imports: [PrismaModule, N8NModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
