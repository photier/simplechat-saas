const axios = require('axios');

const N8N_API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NGMzNzZlOC01ZGFmLTQ5OTctYmM5NC1mMDY4ODFkMWI3NGIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzMDI2NzM0fQ.rnid5EFb3cjOJmvtGNy5dE1-lL18gCLGn36pPvNF1NU';
const N8N_BASE_URL = 'https://n8n.photier.co';

async function listAllWorkflows() {
  try {
    let allWorkflows = [];
    let cursor = null;
    let hasMore = true;

    while (hasMore) {
      const params = { limit: 100 };
      if (cursor) params.cursor = cursor;

      const response = await axios.get(`${N8N_BASE_URL}/api/v1/workflows`, {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY },
        params
      });

      const workflows = response.data.data || [];
      allWorkflows = allWorkflows.concat(workflows);

      cursor = response.data.nextCursor;
      hasMore = response.data.hasMore;

      console.log(`Fetched ${workflows.length} workflows (total: ${allWorkflows.length})`);
    }

    // Photier workflows
    const photierWorkflows = allWorkflows.filter(w =>
      w.name.toLowerCase().includes('photier')
    );

    // Template workflows
    const templateWorkflows = allWorkflows.filter(w =>
      w.name.includes('MASTER') || w.name.includes('Template')
    );

    // Active workflows
    const activeWorkflows = allWorkflows.filter(w => w.active);

    // Archived workflows
    const archivedWorkflows = allWorkflows.filter(w => w.isArchived);

    console.log('\n=== WORKFLOW SUMMARY ===');
    console.log(`Total workflows: ${allWorkflows.length}`);
    console.log(`Active workflows: ${activeWorkflows.length}`);
    console.log(`Archived workflows: ${archivedWorkflows.length}`);
    console.log(`\nPhotier workflows (${photierWorkflows.length}):`);
    photierWorkflows.forEach(w => {
      console.log(`  - ${w.name} (${w.id}): active=${w.active}, archived=${w.isArchived}`);
    });

    console.log(`\nTemplate workflows (${templateWorkflows.length}):`);
    templateWorkflows.forEach(w => {
      console.log(`  - ${w.name} (${w.id}): active=${w.active}, archived=${w.isArchived}`);
    });

    // Duplicate analysis
    const workflowsByBot = {};
    allWorkflows.forEach(w => {
      // Extract chatId from name
      const match = w.name.match(/bot_[a-zA-Z0-9_-]+/);
      if (match) {
        const botId = match[0];
        if (!workflowsByBot[botId]) {
          workflowsByBot[botId] = [];
        }
        workflowsByBot[botId].push(w);
      }
    });

    const duplicates = Object.entries(workflowsByBot).filter(([_, wfs]) => wfs.length > 1);

    if (duplicates.length > 0) {
      console.log(`\n=== DUPLICATE WORKFLOWS (${duplicates.length} bots with duplicates) ===`);
      let totalDuplicates = 0;
      duplicates.slice(0, 10).forEach(([botId, wfs]) => {
        totalDuplicates += wfs.length - 1;
        console.log(`\n${botId} (${wfs.length} copies):`);
        wfs.forEach((w, idx) => {
          const status = w.active ? 'ACTIVE' : 'inactive';
          const archive = w.isArchived ? 'ARCHIVED' : '';
          const keep = idx === 0 ? '✅ KEEP' : '🗑️  DELETE';
          console.log(`  ${keep} - ${w.id} (${status} ${archive}) - updated: ${w.updatedAt}`);
        });
      });
      console.log(`\nTotal duplicate workflows: ${totalDuplicates}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

listAllWorkflows();
