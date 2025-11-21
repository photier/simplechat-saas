const axios = require('axios');

const N8N_API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NGMzNzZlOC01ZGFmLTQ5OTctYmM5NC1mMDY4ODFkMWI3NGIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzMDI2NzM0fQ.rnid5EFb3cjOJmvtGNy5dE1-lL18gCLGn36pPvNF1NU';
const N8N_BASE_URL = 'https://n8n.photier.co';

// Duplicate workflows to DELETE (from analysis)
const workflowsToDelete = [
  // bot_LJlWQhRZol (5 duplicates)
  'jWMvA79yBXaQhrza',
  '94OrX9kXs7PQ9tYV',
  'ek7lvT62lBDaJIXV',
  'AoxOgzbTMrVbP0cX',
  'AmuRVBAFrWniZAqB',

  // bot_WOSOzj5wnM (6 duplicates)
  'cqIcEcEVb9HByalb',
  'kFsDI4srClNXSmSr',
  'FzeUsifamjSRcTqG',
  'Hdj3ZOKyVAHDhpd6',
  'O0WsRUJTIiRQDNoe',
  'sKbTLorDWIX1z4fG',

  // bot_RMtmBN0Noc (7 duplicates - keeping only myK4NnP1XZ3Mse2k)
  'iFLOZDKzCxJrZw0y',
  's85QL1Dl6xRVk5RH',
  'a0Wo67kfMwspWg0p',
  'tmWigKmTuhnho5L4',
  'db6BlyMTFZDPljAD',
  '9A3fz7ZeRXViaWA0',
  'rVqpawvbZbOL0EOB',

  // bot_qzNBwMJmY9 (8 duplicates)
  'l9ug3O5IFXjGkPbC',
  'DMQTScQf19Zjqnep',
  '0hcBNmbCTtfKSEKf',
  '1INMos4AqvsjiwdU',
  '5h6Eh2d3tHVwt0h2',
  'oa3msy1PkJxQoaSz',
  'PG4hCCqAJ8BcWjSA',

  // bot_oLYqcUL7ac (8 duplicates)
  '67DPoqG3L5NA5hMU',
  'fc2xQ2UKxKqkzRwi',
  '07FSrQzAgiKLAiqY',
  'EZTUx1dufENadVAo',
  '7nNXzJGcT7PGytr3',
  '2swLf43LaOjPY7GV',
  '2LxoHSL7BhNoSxoG',
  'oPHhTcIh6i8tFG0S',

  // bot_yjB4Oo3GBj (5 duplicates)
  'cE0f1VQftrxPkmBk',
  'LsWVP4bQNS1Kg9f7',
  'NAfrachIzBLlGiPa',
  'MGnV4v2BnCPhQzEP',
  '9pwY99ub6YfwJqah',

  // Note: hhZZZV3ymeBL7isF was listed but keeping it out for safety
];

async function deleteWorkflow(workflowId) {
  try {
    await axios.delete(`${N8N_BASE_URL}/api/v1/workflows/${workflowId}`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });
    return { success: true, workflowId };
  } catch (error) {
    return {
      success: false,
      workflowId,
      error: error.response?.data?.message || error.message
    };
  }
}

async function deleteAllDuplicates() {
  console.log('======================================================================');
  console.log('🗑️  N8N DUPLICATE WORKFLOW DELETION');
  console.log('======================================================================');
  console.log(`Total workflows to delete: ${workflowsToDelete.length}`);
  console.log('N8N URL:', N8N_BASE_URL);
  console.log('======================================================================\n');

  let successCount = 0;
  let failCount = 0;
  const failures = [];

  for (let i = 0; i < workflowsToDelete.length; i++) {
    const workflowId = workflowsToDelete[i];
    process.stdout.write(`[${i + 1}/${workflowsToDelete.length}] Deleting ${workflowId}... `);

    const result = await deleteWorkflow(workflowId);

    if (result.success) {
      console.log('✅ Deleted');
      successCount++;
    } else {
      console.log(`❌ Failed: ${result.error}`);
      failCount++;
      failures.push(result);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n======================================================================');
  console.log('📊 DELETION SUMMARY');
  console.log('======================================================================');
  console.log(`✅ Successfully deleted: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);

  if (failures.length > 0) {
    console.log('\n❌ Failed workflows:');
    failures.forEach(f => {
      console.log(`  - ${f.workflowId}: ${f.error}`);
    });
  }

  console.log('======================================================================');
}

deleteAllDuplicates().catch(console.error);
