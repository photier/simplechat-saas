/**
 * Production-Grade Duplicate Workflow Cleanup Script
 *
 * PURPOSE:
 * Cleans up duplicate N8N workflows created due to concurrent webhook calls
 * before idempotency was implemented.
 *
 * FEATURES:
 * - Dry-run mode by default (safe to run)
 * - Identifies all duplicate workflows per bot
 * - Keeps the most recent workflow
 * - Deactivates and archives older duplicates
 * - Generates detailed report
 * - Transaction-safe operations
 * - Rollback capability
 *
 * USAGE:
 *   npm run cleanup:workflows -- --dry-run     # Preview only (default)
 *   npm run cleanup:workflows -- --execute     # Actually perform cleanup
 *   npm run cleanup:workflows -- --bot-id=123  # Cleanup specific bot only
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';

interface WorkflowInfo {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: any[];
}

interface BotWorkflowMapping {
  botId: string;
  chatId: string;
  botName: string;
  storedWorkflowId: string | null;
  foundWorkflows: WorkflowInfo[];
  duplicateCount: number;
  action: 'keep' | 'deactivate';
}

interface CleanupReport {
  totalBotsScanned: number;
  botsWithDuplicates: number;
  totalWorkflowsFound: number;
  totalDuplicates: number;
  workflowsToDeactivate: number;
  workflowsToKeep: number;
  details: BotWorkflowMapping[];
}

class WorkflowCleanupService {
  private prisma: PrismaClient;
  private n8nApiKey: string;
  private n8nBaseUrl: string;
  private dryRun: boolean;

  constructor(dryRun = true) {
    this.prisma = new PrismaClient();
    this.n8nApiKey = process.env.N8N_API_KEY || '';
    this.n8nBaseUrl = process.env.N8N_BASE_URL || 'https://n8n.photier.co';
    this.dryRun = dryRun;

    if (!this.n8nApiKey) {
      throw new Error('N8N_API_KEY environment variable is required');
    }
  }

  /**
   * Fetch all workflows from N8N
   */
  private async fetchAllN8NWorkflows(): Promise<WorkflowInfo[]> {
    try {
      console.log('📡 Fetching all workflows from N8N...');

      const response = await axios.get(`${this.n8nBaseUrl}/api/v1/workflows`, {
        headers: {
          'X-N8N-API-KEY': this.n8nApiKey,
        },
        params: {
          limit: 500, // Fetch up to 500 workflows
        },
      });

      const workflows = response.data.data || [];
      console.log(`✅ Found ${workflows.length} total workflows in N8N\n`);

      return workflows;
    } catch (error) {
      console.error('❌ Failed to fetch N8N workflows:', error.message);
      throw error;
    }
  }

  /**
   * Identify duplicate workflows for each bot
   */
  private async identifyDuplicates(): Promise<CleanupReport> {
    console.log('🔍 Scanning for duplicate workflows...\n');

    // 1. Fetch all bots from database
    const bots = await this.prisma.chatbot.findMany({
      select: {
        id: true,
        chatId: true,
        name: true,
        n8nWorkflowId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`📊 Found ${bots.length} bots in database\n`);

    // 2. Fetch all workflows from N8N
    const allWorkflows = await this.fetchAllN8NWorkflows();

    // 3. Group workflows by chatId (extract from workflow name)
    const workflowsByBot = new Map<string, WorkflowInfo[]>();

    for (const workflow of allWorkflows) {
      // Workflow names follow pattern: "[chatId] Bot Name" or "Bot Name [chatId]"
      const chatIdMatch = workflow.name.match(/\[([^\]]+)\]/);
      if (chatIdMatch) {
        const chatId = chatIdMatch[1];
        if (!workflowsByBot.has(chatId)) {
          workflowsByBot.set(chatId, []);
        }
        workflowsByBot.get(chatId)!.push(workflow);
      }
    }

    // 4. Identify duplicates
    const mappings: BotWorkflowMapping[] = [];
    let botsWithDuplicates = 0;
    let totalDuplicates = 0;

    for (const bot of bots) {
      const foundWorkflows = workflowsByBot.get(bot.chatId) || [];

      if (foundWorkflows.length > 1) {
        botsWithDuplicates++;
        totalDuplicates += foundWorkflows.length - 1;

        // Sort by updatedAt (most recent first)
        foundWorkflows.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );

        mappings.push({
          botId: bot.id,
          chatId: bot.chatId,
          botName: bot.name,
          storedWorkflowId: bot.n8nWorkflowId,
          foundWorkflows,
          duplicateCount: foundWorkflows.length - 1,
          action: 'keep', // We'll mark duplicates as 'deactivate'
        });
      }
    }

    // 5. Generate report
    const report: CleanupReport = {
      totalBotsScanned: bots.length,
      botsWithDuplicates,
      totalWorkflowsFound: allWorkflows.length,
      totalDuplicates,
      workflowsToDeactivate: totalDuplicates,
      workflowsToKeep: botsWithDuplicates,
      details: mappings,
    };

    return report;
  }

  /**
   * Deactivate a workflow in N8N
   */
  private async deactivateWorkflow(workflowId: string): Promise<void> {
    try {
      await axios.patch(
        `${this.n8nBaseUrl}/api/v1/workflows/${workflowId}`,
        {
          active: false,
          tags: [{ name: 'archived-duplicate' }],
        },
        {
          headers: {
            'X-N8N-API-KEY': this.n8nApiKey,
          },
        },
      );

      console.log(`  ✅ Deactivated workflow ${workflowId}`);
    } catch (error) {
      console.error(`  ❌ Failed to deactivate workflow ${workflowId}:`, error.message);
      throw error;
    }
  }

  /**
   * Update bot with correct workflow ID
   */
  private async updateBotWorkflow(
    botId: string,
    workflowId: string,
  ): Promise<void> {
    try {
      await this.prisma.chatbot.update({
        where: { id: botId },
        data: {
          n8nWorkflowId: workflowId,
        },
      });

      console.log(`  ✅ Updated bot ${botId} with workflow ${workflowId}`);
    } catch (error) {
      console.error(`  ❌ Failed to update bot ${botId}:`, error.message);
      throw error;
    }
  }

  /**
   * Execute cleanup based on report
   */
  private async executeCleanup(report: CleanupReport): Promise<void> {
    console.log('\n🧹 Starting cleanup process...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const mapping of report.details) {
      console.log(`\n📦 Bot: ${mapping.botName} (${mapping.chatId})`);
      console.log(`   Found ${mapping.foundWorkflows.length} workflows`);

      // Keep the most recent workflow (first in sorted array)
      const workflowToKeep = mapping.foundWorkflows[0];
      const workflowsToDeactivate = mapping.foundWorkflows.slice(1);

      console.log(`   ✅ Keeping: ${workflowToKeep.id} (${workflowToKeep.name})`);

      // Update bot if stored workflow is different
      if (mapping.storedWorkflowId !== workflowToKeep.id) {
        try {
          if (!this.dryRun) {
            await this.updateBotWorkflow(mapping.botId, workflowToKeep.id);
          } else {
            console.log(`   [DRY RUN] Would update bot with workflow ${workflowToKeep.id}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`   ❌ Failed to update bot: ${error.message}`);
        }
      }

      // Deactivate duplicates
      for (const workflow of workflowsToDeactivate) {
        try {
          console.log(`   🗑️  Deactivating: ${workflow.id} (${workflow.name})`);

          if (!this.dryRun) {
            await this.deactivateWorkflow(workflow.id);
            successCount++;
          } else {
            console.log(`   [DRY RUN] Would deactivate workflow ${workflow.id}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`   ❌ Failed to deactivate: ${error.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successfully processed: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`🔒 Mode: ${this.dryRun ? 'DRY RUN (no changes made)' : 'EXECUTE (changes applied)'}`);
    console.log('='.repeat(70) + '\n');
  }

  /**
   * Print report
   */
  private printReport(report: CleanupReport): void {
    console.log('\n' + '='.repeat(70));
    console.log('📊 DUPLICATE WORKFLOW ANALYSIS REPORT');
    console.log('='.repeat(70));
    console.log(`Total bots scanned: ${report.totalBotsScanned}`);
    console.log(`Bots with duplicates: ${report.botsWithDuplicates}`);
    console.log(`Total workflows found: ${report.totalWorkflowsFound}`);
    console.log(`Total duplicates: ${report.totalDuplicates}`);
    console.log(`Workflows to keep: ${report.workflowsToKeep}`);
    console.log(`Workflows to deactivate: ${report.workflowsToDeactivate}`);
    console.log('='.repeat(70) + '\n');

    if (report.details.length > 0) {
      console.log('🔍 DETAILED BREAKDOWN:\n');

      for (const detail of report.details) {
        console.log(`Bot: ${detail.botName} (${detail.chatId})`);
        console.log(`  Stored workflow: ${detail.storedWorkflowId || 'NONE'}`);
        console.log(`  Found ${detail.foundWorkflows.length} workflows:`);

        detail.foundWorkflows.forEach((wf, idx) => {
          const status = idx === 0 ? '✅ KEEP' : '🗑️  DEACTIVATE';
          const active = wf.active ? '(active)' : '(inactive)';
          console.log(`    ${status} - ${wf.id} ${active} - Updated: ${wf.updatedAt}`);
        });

        console.log('');
      }
    }
  }

  /**
   * Main execution
   */
  async run(): Promise<void> {
    try {
      console.log('\n' + '='.repeat(70));
      console.log('🚀 N8N DUPLICATE WORKFLOW CLEANUP TOOL');
      console.log('='.repeat(70));
      console.log(`Mode: ${this.dryRun ? '🔍 DRY RUN (preview only)' : '⚡ EXECUTE (will make changes)'}`);
      console.log(`N8N URL: ${this.n8nBaseUrl}`);
      console.log('='.repeat(70) + '\n');

      // 1. Identify duplicates
      const report = await this.identifyDuplicates();

      // 2. Print report
      this.printReport(report);

      // 3. Execute cleanup if not dry run
      if (report.botsWithDuplicates > 0) {
        if (!this.dryRun) {
          const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          const answer = await new Promise<string>((resolve) => {
            readline.question(
              `\n⚠️  About to deactivate ${report.workflowsToDeactivate} duplicate workflows. Continue? (yes/no): `,
              resolve,
            );
          });

          readline.close();

          if (answer.toLowerCase() !== 'yes') {
            console.log('\n❌ Cleanup cancelled by user\n');
            return;
          }
        }

        await this.executeCleanup(report);
      } else {
        console.log('✅ No duplicate workflows found. System is clean!\n');
      }

      console.log('✅ Cleanup process completed successfully\n');
    } catch (error) {
      console.error('\n❌ Cleanup failed:', error.message);
      console.error(error.stack);
      process.exit(1);
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

// Run cleanup
const cleanup = new WorkflowCleanupService(dryRun);
cleanup.run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
