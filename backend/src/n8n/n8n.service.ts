import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios, { AxiosInstance } from 'axios';

interface N8NWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings: any;
}

@Injectable()
export class N8NService {
  private readonly logger = new Logger(N8NService.name);
  private readonly api: AxiosInstance;

  constructor(private prisma: PrismaService) {
    // Initialize N8N API client
    const baseURL = process.env.N8N_BASE_URL || 'https://n8n.simplechat.bot';
    this.api = axios.create({
      baseURL: `${baseURL}/api/v1`,
      headers: {
        'X-N8N-API-KEY': process.env.N8N_API_TOKEN || '',
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * Clone N8N workflow from template for a new chatbot (Multi-Bot Architecture)
   */
  async cloneWorkflowForChatbot(
    chatbotId: string,
    chatId: string,
    type: 'BASIC' | 'PREMIUM',
  ) {
    try {
      // 1. Select template based on bot type
      const templateId =
        type === 'PREMIUM'
          ? process.env.N8N_PREMIUM_TEMPLATE_ID || '2'
          : process.env.N8N_BASIC_TEMPLATE_ID || '1';

      this.logger.log(
        `Cloning workflow from template ${templateId} for chatbot ${chatbotId}`,
      );

      // 2. Fetch the template workflow
      const { data: template } = await this.api.get<N8NWorkflow>(
        `/workflows/${templateId}`,
      );

      // 3. Create new workflow with modified name and webhook path
      const newWorkflowName = `[${type}] Bot ${chatId}`;

      // 4. Update webhook nodes to use bot-specific path
      const updatedNodes = template.nodes.map((node) => {
        if (node.type === 'n8n-nodes-base.webhook') {
          return {
            ...node,
            parameters: {
              ...node.parameters,
              path: `bot_${chatId}`,
            },
          };
        }
        return node;
      });

      // 5. Create the new workflow
      const { data: newWorkflow } = await this.api.post<N8NWorkflow>(
        '/workflows',
        {
          name: newWorkflowName,
          nodes: updatedNodes,
          connections: template.connections,
          settings: {}, // Required but must be empty
        },
      );

      this.logger.log(
        `Created workflow ${newWorkflow.id} for chatbot ${chatbotId}`,
      );

      // 6. Generate webhook URL
      const webhookUrl = `${process.env.N8N_BASE_URL}/webhook/bot_${chatId}`;

      return {
        workflowId: newWorkflow.id,
        workflowName: newWorkflow.name,
        webhookUrl,
      };
    } catch (error) {
      this.logger.error(
        `Failed to clone workflow for chatbot ${chatbotId}`,
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to create N8N workflow. Please contact support.',
      );
    }
  }

  /**
   * Clone N8N workflow from template for a new tenant (Legacy - for backward compatibility)
   * @deprecated Use cloneWorkflowForChatbot instead - TenantWorkflow table removed in multi-bot architecture
   */
  async cloneWorkflowForTenant(
    tenantId: string,
    chatId: string,
    plan: 'BASIC' | 'PREMIUM',
  ) {
    throw new BadRequestException(
      'This method is deprecated. Use cloneWorkflowForChatbot instead. TenantWorkflow table has been removed in favor of multi-bot Chatbot model.',
    );
  }

  /**
   * Activate tenant workflow
   * @deprecated TenantWorkflow table removed - use chatbot-based workflow management
   */
  async activateWorkflow(tenantId: string) {
    throw new BadRequestException(
      'This method is deprecated. TenantWorkflow table has been removed. Use chatbot-based workflow management instead.',
    );
  }

  /**
   * Deactivate tenant workflow
   * @deprecated TenantWorkflow table removed - use chatbot-based workflow management
   */
  async deactivateWorkflow(tenantId: string) {
    throw new BadRequestException(
      'This method is deprecated. TenantWorkflow table has been removed. Use chatbot-based workflow management instead.',
    );
  }

  /**
   * Delete tenant workflow (when tenant is deleted)
   * @deprecated TenantWorkflow table removed - use chatbot-based workflow management
   */
  async deleteWorkflow(tenantId: string) {
    throw new BadRequestException(
      'This method is deprecated. TenantWorkflow table has been removed. Use chatbot-based workflow management instead.',
    );
  }

  /**
   * Get tenant workflow info
   * @deprecated TenantWorkflow table removed - use chatbot-based workflow management
   */
  async getWorkflow(tenantId: string) {
    throw new BadRequestException(
      'This method is deprecated. TenantWorkflow table has been removed. Use chatbot-based workflow management instead.',
    );
  }

  /**
   * Update workflow configuration (advanced)
   * @deprecated TenantWorkflow table removed - use chatbot-based workflow management
   */
  async updateWorkflowConfig(tenantId: string, config: any) {
    throw new BadRequestException(
      'This method is deprecated. TenantWorkflow table has been removed. Use chatbot-based workflow management instead.',
    );
  }
}
