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
   * Recursively replace template variables in node parameters
   */
  private replaceTemplateVariables(
    obj: any,
    replacements: Record<string, string>,
  ): any {
    if (typeof obj === 'string') {
      // Replace all template variables in strings
      let result = obj;
      for (const [key, value] of Object.entries(replacements)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
      return result;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.replaceTemplateVariables(item, replacements));
    }

    if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = this.replaceTemplateVariables(value, replacements);
      }
      return newObj;
    }

    return obj;
  }

  /**
   * Clone N8N workflow from template for a new chatbot (Multi-Bot Architecture)
   */
  async cloneWorkflowForChatbot(
    chatbotId: string,
    chatId: string,
    tenantId: string,
    type: 'BASIC' | 'PREMIUM',
    config: {
      websiteUrl?: string;
      description?: string;
      aiInstructions?: string;
      telegramMode?: 'managed' | 'custom';
      telegramGroupId?: string;
      telegramBotToken?: string;
    },
  ) {
    try {
      // 1. Select template based on bot type
      const templateId =
        type === 'PREMIUM'
          ? process.env.N8N_PREMIUM_TEMPLATE_ID || 'qUdSkgFqZ1PnDKV1'
          : process.env.N8N_BASIC_TEMPLATE_ID || 'TE105JKbkc8xNsNy'; // New cleaned BASIC template

      this.logger.log(
        `Cloning workflow from template ${templateId} for chatbot ${chatbotId}`,
      );

      // 2. Fetch the template workflow
      const { data: template } = await this.api.get<N8NWorkflow>(
        `/workflows/${templateId}`,
      );

      // 3. Prepare dynamic values
      const newWorkflowName = `[${type}] Bot ${chatId}`;
      const widgetServerUrl =
        type === 'PREMIUM'
          ? 'https://p-chat.simplechat.bot'
          : 'https://chat.simplechat.bot';

      // Determine Telegram credentials
      this.logger.log(
        `Config received: ${JSON.stringify(config)}`,
      );

      const telegramBotToken =
        config.telegramMode === 'custom' && config.telegramBotToken
          ? config.telegramBotToken
          : process.env.TELEGRAM_BOT_TOKEN || '';
      const telegramGroupId = config.telegramGroupId || process.env.TELEGRAM_GROUP_ID || '';

      // AI instructions (default if not provided)
      const aiInstructions =
        config.aiInstructions ||
        `You are a helpful AI assistant for ${config.websiteUrl || 'this website'}. Answer questions clearly and professionally.`;

      this.logger.log(
        `Telegram config - Mode: ${config.telegramMode}, Bot Token: ${telegramBotToken ? 'set' : 'missing'}, Group ID: ${telegramGroupId || 'MISSING!'}`,
      );

      // 3.5: Replace ALL template variables recursively in all nodes
      const templateVariables = {
        CHATBOT_ID: chatId,
        TENANT_ID: tenantId,
        TELEGRAM_GROUP_ID: telegramGroupId,
        TELEGRAM_BOT_TOKEN: telegramBotToken,
      };

      this.logger.log(
        `Replacing template variables: ${JSON.stringify(templateVariables)}`,
      );

      // Apply template variable replacement to ALL nodes
      template.nodes = template.nodes.map((node) =>
        this.replaceTemplateVariables(node, templateVariables),
      );

      this.logger.log(
        `Template variable replacement complete for ${template.nodes.length} nodes`,
      );

      // DEBUG: Log all HTTP Request nodes from template BEFORE updates
      const httpRequestNodesBefore = template.nodes.filter(n => n.type === 'n8n-nodes-base.httpRequest');
      this.logger.log(`[BEFORE] Found ${httpRequestNodesBefore.length} HTTP Request nodes in template`);
      httpRequestNodesBefore.forEach(node => {
        this.logger.log(`[BEFORE] HTTP Request node "${node.name}":
  - url: ${node.parameters?.url || 'N/A'}
  - hasJsonBody: ${!!node.parameters?.jsonBody}
  - hasBodyParameters: ${!!node.parameters?.bodyParameters}
  - bodyParameters: ${JSON.stringify(node.parameters?.bodyParameters?.parameters || []).substring(0, 200)}`);
      });

      // 4. Update all nodes with bot-specific configuration
      const updatedNodes = template.nodes.map((node) => {
        // 4.1 Webhook nodes - Update path
        if (node.type === 'n8n-nodes-base.webhook') {
          return {
            ...node,
            parameters: {
              ...node.parameters,
              path: chatId, // chatId already includes 'bot_' prefix
            },
          };
        }

        // 4.2 Telegram nodes - Update Group ID
        if (
          node.type === 'n8n-nodes-base.telegram' &&
          node.parameters?.chatId
        ) {
          return {
            ...node,
            parameters: {
              ...node.parameters,
              chatId: telegramGroupId || node.parameters.chatId,
            },
          };
        }

        // 4.3 HTTP Request nodes - Update URLs, Telegram bot token, AND chat_id
        if (node.type === 'n8n-nodes-base.httpRequest') {
          this.logger.log(`[DURING] Processing HTTP Request node "${node.name}"`);

          let updatedNode = { ...node };
          let wasUpdated = false;

          // 4.3a: Update URL (Telegram bot token + widget server URLs)
          if (node.parameters?.url) {
            let newUrl = node.parameters.url;

            // Replace Telegram bot token in API URLs
            if (newUrl.includes('api.telegram.org/bot')) {
              const oldUrl = newUrl;
              newUrl = newUrl.replace(
                /bot[0-9]+:[A-Za-z0-9_-]+/,
                `bot${telegramBotToken}`,
              );
              if (oldUrl !== newUrl) {
                this.logger.log(`[DURING] Updated bot token in URL for "${node.name}"`);
                wasUpdated = true;
              }
            }

            // Replace widget server URLs
            if (newUrl.includes('/send-to-user')) {
              newUrl = `${widgetServerUrl}/send-to-user`;
              this.logger.log(`[DURING] Updated widget server URL for "${node.name}"`);
              wasUpdated = true;
            }

            updatedNode = {
              ...updatedNode,
              parameters: {
                ...updatedNode.parameters,
                url: newUrl,
              },
            };
          }

          // 4.3b: Update Telegram chat_id in bodyParameters
          if (telegramGroupId && node.parameters?.bodyParameters?.parameters) {
            const updatedParams = node.parameters.bodyParameters.parameters.map(
              (param: any) => {
                if (param.name === 'chat_id') {
                  this.logger.log(
                    `[DURING] Updated bodyParameters chat_id in "${node.name}" from ${param.value} to ${telegramGroupId}`,
                  );
                  wasUpdated = true;
                  return {
                    ...param,
                    value: telegramGroupId,
                  };
                }
                return param;
              },
            );

            updatedNode = {
              ...updatedNode,
              parameters: {
                ...updatedNode.parameters,
                bodyParameters: {
                  ...node.parameters.bodyParameters,
                  parameters: updatedParams,
                },
              },
            };
          }

          // 4.3c: Update Telegram chat_id in jsonBody
          if (
            telegramGroupId &&
            node.parameters?.sendBody &&
            node.parameters?.jsonBody &&
            typeof node.parameters.jsonBody === 'string' &&
            node.parameters.jsonBody.includes('chat_id')
          ) {
            try {
              const jsonBody = node.parameters.jsonBody.replace(
                /"chat_id"\s*:\s*"-?\d+"/g,
                `"chat_id": "${telegramGroupId}"`,
              );
              updatedNode = {
                ...updatedNode,
                parameters: {
                  ...updatedNode.parameters,
                  jsonBody,
                },
              };
              wasUpdated = true;
              this.logger.log(
                `[DURING] Updated jsonBody chat_id in "${node.name}" to ${telegramGroupId}`,
              );
            } catch (e) {
              this.logger.warn(`[DURING] Could not parse JSON body for "${node.name}"`);
            }
          }

          if (wasUpdated) {
            this.logger.log(`[DURING] ✅ Updated HTTP Request node "${node.name}"`);
            return updatedNode;
          }

          // If no updates were made, still return the node (with URL updated if applicable)
          return updatedNode;
        }

        // 4.4 AI Agent nodes - Update system message
        if (
          node.type === '@n8n/n8n-nodes-langchain.agent' &&
          node.parameters?.options?.systemMessage
        ) {
          return {
            ...node,
            parameters: {
              ...node.parameters,
              options: {
                ...node.parameters.options,
                systemMessage: aiInstructions,
              },
            },
          };
        }

        // 4.5 PostgreSQL nodes - Update schema to 'saas', add chatbot_id/tenant_id
        if (
          node.type === 'n8n-nodes-base.postgres' &&
          node.parameters?.schema
        ) {
          // Log ALL postgres nodes to debug
          this.logger.log(
            `Postgres node "${node.name}" - Full parameters: ${JSON.stringify(node.parameters, null, 2).substring(0, 500)}...`,
          );

          const updatedParams = {
            ...node.parameters,
            schema: {
              ...node.parameters.schema,
              value: 'saas', // Change from 'public' to 'saas'
            },
          };

          // INSERT nodes: Add chatbot_id and tenant_id to columns (snake_case to match DB schema)
          // Note: INSERT nodes in N8N template don't have 'operation' field - they only have columns + table
          if (
            node.parameters?.columns &&
            !node.parameters?.operation // INSERT nodes have NO operation field!
          ) {
            this.logger.log(
              `INSERT node "${node.name}" - Adding chatbot_id and tenant_id`,
            );

            updatedParams.columns = {
              ...node.parameters.columns,
              value: {
                ...node.parameters.columns.value,
                chatbot_id: chatId,
                tenant_id: tenantId,
                // Update premium field if exists
                ...(node.parameters.columns.value.premium !== undefined && {
                  premium: type === 'PREMIUM',
                }),
              },
            };

            this.logger.log(
              `INSERT node "${node.name}" - Added chatbot_id: ${chatId}, tenant_id: ${tenantId}`,
            );
          }

          // SELECT/UPDATE/DELETE nodes: Add chatbot_id to WHERE clause (snake_case to match DB schema)
          if (
            (node.parameters?.operation === 'select' ||
              node.parameters?.operation === 'update' ||
              node.parameters?.operation === 'delete') &&
            node.parameters?.where
          ) {
            const existingValues = node.parameters.where.values || [];

            // Only add if not already present
            const hasChatbotId = existingValues.some(
              (v: any) => v.column === 'chatbot_id',
            );

            if (!hasChatbotId) {
              updatedParams.where = {
                ...node.parameters.where,
                values: [
                  ...existingValues,
                  {
                    column: 'chatbot_id',
                    value: chatId,
                  },
                ],
              };
            }
          }

          // UPDATE nodes: Add chatbot_id and tenant_id to SET columns if setting them
          if (
            node.parameters?.operation === 'update' &&
            node.parameters?.columns?.value
          ) {
            // Check if columns are being set (not just WHERE clause)
            updatedParams.columns = {
              ...node.parameters.columns,
              value: {
                ...node.parameters.columns.value,
                ...(node.parameters.columns.value.premium !== undefined && {
                  premium: type === 'PREMIUM',
                }),
              },
            };
          }

          return {
            ...node,
            parameters: updatedParams,
          };
        }

        return node;
      });

      // DEBUG: Log all HTTP Request nodes AFTER updates
      const httpRequestNodesAfter = updatedNodes.filter(n => n.type === 'n8n-nodes-base.httpRequest');
      this.logger.log(`[AFTER] Found ${httpRequestNodesAfter.length} HTTP Request nodes after updates`);
      httpRequestNodesAfter.forEach(node => {
        this.logger.log(`[AFTER] HTTP Request node "${node.name}":
  - url: ${node.parameters?.url || 'N/A'}
  - bodyParameters: ${JSON.stringify(node.parameters?.bodyParameters?.parameters || []).substring(0, 300)}`);
      });

      // 5. Create the new workflow with execution save settings
      const { data: newWorkflow } = await this.api.post<N8NWorkflow>(
        '/workflows',
        {
          name: newWorkflowName,
          nodes: updatedNodes,
          connections: template.connections,
          settings: {
            saveExecutionProgress: true, // Save execution progress for resume
            saveManualExecutions: true, // Save manual executions
            saveDataErrorExecution: 'all', // Save all failed executions
            saveDataSuccessExecution: 'all', // Save all successful executions
          },
        },
      );

      this.logger.log(
        `Created workflow ${newWorkflow.id} for chatbot ${chatbotId}`,
      );

      // DEBUG: Log what N8N returned
      const httpRequestNodesReturned = newWorkflow.nodes.filter(n => n.type === 'n8n-nodes-base.httpRequest');
      this.logger.log(`[N8N RESPONSE] N8N returned ${httpRequestNodesReturned.length} HTTP Request nodes`);
      httpRequestNodesReturned.forEach(node => {
        this.logger.log(`[N8N RESPONSE] HTTP Request node "${node.name}":
  - url: ${node.parameters?.url || 'N/A'}
  - bodyParameters: ${JSON.stringify(node.parameters?.bodyParameters?.parameters || []).substring(0, 300)}`);
      });

      // 6. Activate the workflow using POST /activate endpoint
      try {
        await this.api.post(`/workflows/${newWorkflow.id}/activate`, {});
        this.logger.log(`Activated workflow ${newWorkflow.id}`);
      } catch (error) {
        this.logger.warn(
          `Could not auto-activate workflow ${newWorkflow.id}: ${error.response?.data?.message || error.message}. User can activate manually in N8N.`,
        );
        // Continue anyway - workflow is created, can be activated manually
      }

      // 7. Generate webhook URL
      const webhookUrl = `${process.env.N8N_BASE_URL}/webhook/${chatId}`; // chatId already includes 'bot_' prefix

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
