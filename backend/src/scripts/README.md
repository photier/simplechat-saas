# Backend Maintenance Scripts

Production-grade maintenance scripts for the SimpleChat SaaS platform.

## Duplicate Workflow Cleanup

### Overview
The `cleanup-duplicate-workflows.ts` script identifies and removes duplicate N8N workflows that were created due to concurrent webhook calls before idempotency was implemented.

### Problem Statement
When Iyzico payment webhooks were retried or arrived concurrently, multiple workflows were created for the same bot, resulting in:
- Resource waste (59+ duplicate workflows)
- Confusion about which workflow is active
- Potential billing issues
- System instability

### Solution
This script:
1. Scans all bots in the database
2. Identifies workflows in N8N by matching chatId
3. Finds duplicates (multiple workflows for same bot)
4. Keeps the most recently updated workflow
5. Deactivates and archives older duplicates
6. Updates bot records with correct workflow IDs

### Safety Features
- **Dry-run by default**: Preview changes before executing
- **Interactive confirmation**: Requires explicit "yes" to proceed
- **Transaction-safe**: Database operations are atomic
- **Detailed logging**: Full audit trail of all actions
- **Error handling**: Continues on individual failures
- **Rollback capability**: Database transactions can be rolled back

### Usage

#### 1. Preview Mode (Dry Run - RECOMMENDED FIRST)
```bash
cd backend
npm run cleanup:workflows
```

This will:
- Scan all bots and workflows
- Generate detailed report
- **NOT make any changes**
- Show what would be done

#### 2. Execute Mode (Actually Perform Cleanup)
```bash
cd backend
npm run cleanup:workflows:execute
```

This will:
- Scan all bots and workflows
- Show summary report
- **Ask for confirmation**
- Actually deactivate duplicate workflows
- Update bot records

### Environment Variables Required
```bash
N8N_API_KEY=your_n8n_api_key
N8N_BASE_URL=https://n8n.photier.co
DATABASE_URL=postgresql://...
```

### Example Output

#### Dry Run Mode:
```
======================================================================
🚀 N8N DUPLICATE WORKFLOW CLEANUP TOOL
======================================================================
Mode: 🔍 DRY RUN (preview only)
N8N URL: https://n8n.photier.co
======================================================================

📡 Fetching all workflows from N8N...
✅ Found 125 total workflows in N8N

🔍 Scanning for duplicate workflows...

📊 Found 50 bots in database

======================================================================
📊 DUPLICATE WORKFLOW ANALYSIS REPORT
======================================================================
Total bots scanned: 50
Bots with duplicates: 4
Total workflows found: 125
Total duplicates: 23
Workflows to keep: 4
Workflows to deactivate: 23
======================================================================

🔍 DETAILED BREAKDOWN:

Bot: Test Bot 1 (bot_LJlWQhRZol)
  Stored workflow: hmcV1RMv5G20FqZl
  Found 6 workflows:
    ✅ KEEP - AmuRVBAFrWniZAqB (active) - Updated: 2025-01-20T10:30:00Z
    🗑️  DEACTIVATE - AoxOgzbTMrVbP0cX (active) - Updated: 2025-01-20T10:29:45Z
    🗑️  DEACTIVATE - ek7lvT62lBDaJIXV (active) - Updated: 2025-01-20T10:29:30Z
    🗑️  DEACTIVATE - 94OrX9kXs7PQ9tYV (active) - Updated: 2025-01-20T10:29:15Z
    🗑️  DEACTIVATE - jWMvA79yBXaQhrza (active) - Updated: 2025-01-20T10:29:00Z
    🗑️  DEACTIVATE - hmcV1RMv5G20FqZl (active) - Updated: 2025-01-20T10:28:45Z
```

#### Execute Mode:
```
⚠️  About to deactivate 23 duplicate workflows. Continue? (yes/no): yes

🧹 Starting cleanup process...

📦 Bot: Test Bot 1 (bot_LJlWQhRZol)
   Found 6 workflows
   ✅ Keeping: AmuRVBAFrWniZAqB (Test Bot 1)
   [DRY RUN] Would update bot with workflow AmuRVBAFrWniZAqB
   🗑️  Deactivating: AoxOgzbTMrVbP0cX
   ✅ Deactivated workflow AoxOgzbTMrVbP0cX
   ...

======================================================================
📊 CLEANUP SUMMARY
======================================================================
✅ Successfully processed: 23
❌ Errors: 0
🔒 Mode: EXECUTE (changes applied)
======================================================================
```

### Post-Cleanup Verification

After running the cleanup, verify:

1. **Check N8N Dashboard**:
   - Duplicate workflows should be inactive
   - Tagged with "archived-duplicate"
   - Most recent workflow per bot is active

2. **Check Database**:
   ```sql
   SELECT chatId, name, n8nWorkflowId, status
   FROM "Chatbot"
   WHERE status = 'ACTIVE'
   ORDER BY "createdAt" DESC;
   ```

3. **Test Webhook**:
   - Send test message to bot
   - Verify AI responses work
   - Check N8N execution logs

### Troubleshooting

#### Script Fails with "N8N_API_KEY is required"
```bash
# Export environment variable
export N8N_API_KEY="your_api_key"
# Or create .env file in backend/
```

#### Script Can't Connect to N8N
```bash
# Check N8N URL
curl -H "X-N8N-API-KEY: $N8N_API_KEY" https://n8n.photier.co/api/v1/workflows
```

#### Database Connection Issues
```bash
# Verify DATABASE_URL
echo $DATABASE_URL
# Test connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Chatbot\";"
```

### Recovery Procedure

If cleanup causes issues:

1. **Workflow Not Working**:
   - Check bot's n8nWorkflowId in database
   - Verify workflow is active in N8N
   - Re-create workflow manually if needed

2. **Wrong Workflow Kept**:
   - Use N8N MCP to list workflows
   - Identify correct workflow
   - Update bot manually:
     ```sql
     UPDATE "Chatbot"
     SET "n8nWorkflowId" = 'correct_workflow_id'
     WHERE "chatId" = 'bot_xxx';
     ```

3. **Accidentally Deactivated Active Workflow**:
   - Re-activate in N8N dashboard
   - Or via API:
     ```bash
     curl -X PATCH \
       -H "X-N8N-API-KEY: $N8N_API_KEY" \
       -H "Content-Type: application/json" \
       -d '{"active": true}' \
       https://n8n.photier.co/api/v1/workflows/{workflow_id}
     ```

### Maintenance Schedule

Run this script:
- ✅ After fixing idempotency issues (now)
- ✅ If duplicate workflows are reported
- ✅ During quarterly system audits
- ❌ Not needed for regular operations (idempotency prevents duplicates)

### Related Documentation

- [Idempotency Implementation](../../src/payment/payment.service.ts)
- [N8N Service](../../src/n8n/n8n.service.ts)
- [Payment Webhooks](../../src/payment/payment.controller.ts)

---

**Last Updated**: January 2025
**Status**: Production-Ready
**Requires**: Node.js 22+, ts-node, Prisma, N8N API access
