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
   * Clone N8N workflow from template for a new tenant
   */
  async cloneWorkflowForTenant(
    tenantId: string,
    chatId: string,
    plan: 'BASIC' | 'PREMIUM',
  ) {
    try {
      // 1. Select template based on plan
      const templateId =
        plan === 'PREMIUM'
          ? process.env.N8N_PREMIUM_TEMPLATE_ID || '2'
          : process.env.N8N_BASIC_TEMPLATE_ID || '1';

      this.logger.log(
        `Cloning workflow from template ${templateId} for tenant ${tenantId}`,
      );

      // 2. Fetch the template workflow
      const { data: template } = await this.api.get<N8NWorkflow>(
        `/workflows/${templateId}`,
      );

      // 3. Create new workflow with modified name and webhook path
      const newWorkflowName = `[${plan}] Tenant ${chatId}`;
      
      // 4. Update webhook nodes to use tenant-specific path
      const updatedNodes = template.nodes.map((node) => {
        if (node.type === 'n8n-nodes-base.webhook') {
          return {
            ...node,
            parameters: {
              ...node.parameters,
              path: `tenant_${chatId}`,
            },
          };
        }
        return node;
      });

      // 5. Create the new workflow with empty settings (N8N requires it but rejects template settings)
      const { data: newWorkflow } = await this.api.post<N8NWorkflow>(
        '/workflows',
        {
          name: newWorkflowName,
          nodes: updatedNodes,
          connections: template.connections,
          settings: {}, // Required but must be empty
        },
      );

      this.logger.log(`Created workflow ${newWorkflow.id} for tenant ${tenantId}`);

      // 6. Generate webhook URL
      const webhookUrl = `${process.env.N8N_BASE_URL}/webhook/tenant_${chatId}`;

      // 7. Store workflow info in database
      const tenantWorkflow = await this.prisma.tenantWorkflow.create({
        data: {
          tenantId,
          n8nWorkflowId: newWorkflow.id,
          n8nWorkflowName: newWorkflow.name,
          webhookUrl,
          plan: plan,
          isActive: false,
          clonedFromTemplateId: templateId,
        },
      });

      this.logger.log(
        `Stored workflow mapping in database for tenant ${tenantId}`,
      );

      return {
        workflowId: newWorkflow.id,
        webhookUrl,
        tenantWorkflow,
      };
    } catch (error) {
      this.logger.error(
        `Failed to clone workflow for tenant ${tenantId}`,
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to create N8N workflow. Please contact support.',
      );
    }
  }

  /**
   * Activate tenant workflow
   */
  async activateWorkflow(tenantId: string) {
    try {
      const workflow = await this.prisma.tenantWorkflow.findFirst({
        where: { tenantId },
      });

      if (!workflow) {
        throw new BadRequestException('Workflow not found for tenant');
      }

      // Activate in N8N
      await this.api.patch(`/workflows/${workflow.n8nWorkflowId}`, {
        active: true,
      });

      // Update database
      await this.prisma.tenantWorkflow.update({
        where: { id: workflow.id },
        data: { isActive: true },
      });

      this.logger.log(`Activated workflow for tenant ${tenantId}`);

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to activate workflow for tenant ${tenantId}`,
        error.message,
      );
      throw new InternalServerErrorException('Failed to activate workflow');
    }
  }

  /**
   * Deactivate tenant workflow
   */
  async deactivateWorkflow(tenantId: string) {
    try {
      const workflow = await this.prisma.tenantWorkflow.findFirst({
        where: { tenantId },
      });

      if (!workflow) {
        throw new BadRequestException('Workflow not found for tenant');
      }

      // Deactivate in N8N
      await this.api.patch(`/workflows/${workflow.n8nWorkflowId}`, {
        active: false,
      });

      // Update database
      await this.prisma.tenantWorkflow.update({
        where: { id: workflow.id },
        data: { isActive: false },
      });

      this.logger.log(`Deactivated workflow for tenant ${tenantId}`);

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to deactivate workflow for tenant ${tenantId}`,
        error.message,
      );
      throw new InternalServerErrorException('Failed to deactivate workflow');
    }
  }

  /**
   * Delete tenant workflow (when tenant is deleted)
   */
  async deleteWorkflow(tenantId: string) {
    try {
      const workflow = await this.prisma.tenantWorkflow.findFirst({
        where: { tenantId },
      });

      if (!workflow) {
        return { success: true }; // Already deleted
      }

      // Delete from N8N
      await this.api.delete(`/workflows/${workflow.n8nWorkflowId}`);

      // Delete from database
      await this.prisma.tenantWorkflow.delete({
        where: { id: workflow.id },
      });

      this.logger.log(`Deleted workflow for tenant ${tenantId}`);

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to delete workflow for tenant ${tenantId}`,
        error.message,
      );
      throw new InternalServerErrorException('Failed to delete workflow');
    }
  }

  /**
   * Get tenant workflow info
   */
  async getWorkflow(tenantId: string) {
    const workflow = await this.prisma.tenantWorkflow.findFirst({
      where: { tenantId },
    });

    if (!workflow) {
      throw new BadRequestException('Workflow not found for tenant');
    }

    return workflow;
  }

  /**
   * Update workflow configuration (advanced)
   */
  async updateWorkflowConfig(tenantId: string, config: any) {
    try {
      const workflow = await this.prisma.tenantWorkflow.findFirst({
        where: { tenantId },
      });

      if (!workflow) {
        throw new BadRequestException('Workflow not found for tenant');
      }

      // Update workflow settings in N8N
      await this.api.patch(`/workflows/${workflow.n8nWorkflowId}`, {
        settings: config,
      });

      this.logger.log(`Updated workflow config for tenant ${tenantId}`);

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to update workflow config for tenant ${tenantId}`,
        error.message,
      );
      throw new InternalServerErrorException('Failed to update workflow config');
    }
  }
}
