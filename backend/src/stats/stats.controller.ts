import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatsService } from './stats.service';

@Controller('api/stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  /**
   * Proxy endpoint for tenant dashboard stats
   * Returns stats data from stats backend, filtered by tenantId
   */
  @Get()
  async getStats(
    @Req() req: any,
    @Query('premium') premium?: string,
    @Query('userId') userId?: string,
    @Query('chatbotId') chatbotId?: string,
  ) {
    const tenantId = req.user.id; // Extract from JWT token (user object contains tenant data)

    // Call stats backend with tenantId and optional chatbotId filter
    return this.statsService.getStats({
      tenantId,
      premium: premium === 'true',
      userId,
      chatbotId,
    });
  }

  /**
   * Get messages for specific user
   */
  @Get('messages')
  async getMessages(@Req() req: any, @Query('userId') userId: string) {
    const tenantId = req.user.id; // Extract from JWT token (user object contains tenant data)

    if (!userId) {
      return { error: 'userId is required' };
    }

    return this.statsService.getMessages(tenantId, userId);
  }
}
