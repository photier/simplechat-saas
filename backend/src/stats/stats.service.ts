import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class StatsService {
  private readonly logger = new Logger(StatsService.name);
  private readonly statsBackendUrl =
    process.env.STATS_BACKEND_URL || 'https://stats-production-e4d8.up.railway.app';

  /**
   * Get stats from stats backend
   * Uses Railway direct domain to bypass CORS issues
   */
  async getStats(params: {
    tenantId: string;
    premium: boolean;
    userId?: string;
  }) {
    try {
      const { tenantId, premium, userId } = params;

      this.logger.log(
        `Fetching stats for tenant ${tenantId} (premium: ${premium}, userId: ${userId})`,
      );

      const response = await axios.get(`${this.statsBackendUrl}/api/stats`, {
        params: {
          premium: premium.toString(),
          tenantId,
          ...(userId && { userId }),
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch stats: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to fetch stats from backend',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get messages for specific user
   */
  async getMessages(tenantId: string, userId: string) {
    try {
      this.logger.log(`Fetching messages for user ${userId} (tenant: ${tenantId})`);

      const response = await axios.get(
        `${this.statsBackendUrl}/api/messages/${userId}`,
        {
          params: { tenantId },
          timeout: 10000,
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch messages: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to fetch messages from backend',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
