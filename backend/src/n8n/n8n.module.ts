import { Module } from '@nestjs/common';
import { N8NService } from './n8n.service';
import { N8NController } from './n8n.controller';

@Module({
  providers: [N8NService],
  controllers: [N8NController],
  exports: [N8NService],
})
export class N8NModule {}
