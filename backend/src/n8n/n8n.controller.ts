import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
  Body,
} from '@nestjs/common';
import { N8NService } from './n8n.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('n8n')
@UseGuards(JwtAuthGuard)
export class N8NController {
  constructor(private n8nService: N8NService) {}

  /**
   * Get current tenant's workflow info
   */
  @Get('workflow')
  async getWorkflow(@CurrentUser() user: any) {
    return this.n8nService.getWorkflow(user.id);
  }

  /**
   * Activate workflow
   */
  @Post('workflow/activate')
  async activateWorkflow(@CurrentUser() user: any) {
    return this.n8nService.activateWorkflow(user.id);
  }

  /**
   * Deactivate workflow
   */
  @Post('workflow/deactivate')
  async deactivateWorkflow(@CurrentUser() user: any) {
    return this.n8nService.deactivateWorkflow(user.id);
  }

  /**
   * Update workflow configuration (advanced)
   */
  @Patch('workflow/config')
  async updateWorkflowConfig(
    @CurrentUser() user: any,
    @Body() config: any,
  ) {
    return this.n8nService.updateWorkflowConfig(user.id, config);
  }
}
