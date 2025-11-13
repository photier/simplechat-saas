# 🤖 Multi-Bot SaaS Architecture

**Last Updated:** January 2025  
**Status:** Implementation Phase

---

## 🎯 Core Concept

**1 Tenant = Multiple Chatbots**

```
Tenant: acme.simplechat.bot (Dashboard)
  └─ Bot 1: "Sales Bot" (BASIC) → acme-sales.w.simplechat.bot
  └─ Bot 2: "Support Bot" (PREMIUM) → acme-support.p.simplechat.bot  
  └─ Bot 3: "HR Bot" (BASIC) → acme-hr.w.simplechat.bot
```

---

## 📋 User Journey

```
1. Sign Up
   ↓
   Email: john@acme.com
   Password: ••••••••
   Company: Acme Inc
   ↓
   ✅ Tenant Created
   Subdomain: acme.simplechat.bot
   NO BOTS CREATED YET
   
2. Login to Dashboard
   ↓
   URL: acme.simplechat.bot
   ↓
   Empty state: "You have no chatbots yet"
   [+ Create Your First Bot] button
   
3. Click "+ Create Bot"
   ↓
   Modal opens:
   - Bot Name: "Sales Bot"
   - Bot Type: ○ BASIC  ○ PREMIUM
   - [Continue to Payment] button
   
4. Payment Page (Dummy for now)
   ↓
   Selected: PREMIUM - $19.99/month
   [Purchase Bot] button
   ↓
   ✅ Payment successful (dummy)
   
5. Auto-Provisioning (2-3 seconds)
   ↓
   - Generate chatId: bot_abc123
   - Clone N8N workflow (PREMIUM template)
   - Create bot record in database
   - Status: ACTIVE
   
6. Bot Dashboard
   ↓
   Bot list shows: "Sales Bot" (PREMIUM)
   Click to configure:
   - Widget appearance
   - Embed code
   - Telegram integration
   - AI settings
   
7. Create More Bots
   ↓
   Click [+ New Bot] again
   Repeat process
   Each bot = separate payment
```

---

## 🗄️ Database Changes

### New Model: Chatbot

```prisma
model Chatbot {
  id          String   @id @default(uuid())
  tenantId    String
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  // Bot Info
  name        String   // "Sales Bot", "Support Bot"
  type        BotType  // BASIC | PREMIUM
  chatId      String   @unique // bot_abc123
  apiKey      String   @unique
  
  // Status
  status      BotStatus @default(PENDING_PAYMENT)
    // PENDING_PAYMENT, ACTIVE, PAUSED, DELETED
  
  // N8N Integration
  n8nWorkflowId      String?  @unique
  n8nWorkflowName    String?
  webhookUrl         String?
  
  // Configuration
  config      Json     // Widget settings
  
  // Billing
  subscriptionId     String?  // Iyzico subscription ID
  subscriptionStatus String?  // active, past_due, canceled
  trialEndsAt        DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@schema("saas")
}

enum BotType {
  BASIC
  PREMIUM
  
  @@schema("saas")
}

enum BotStatus {
  PENDING_PAYMENT  // Created but not paid
  ACTIVE           // Paid and working
  PAUSED           // Payment failed
  DELETED          // Soft deleted
  
  @@schema("saas")
}
```

### Updated Tenant Model

```prisma
model Tenant {
  id             String    @id @default(uuid())
  email          String?   @unique
  passwordHash   String?
  fullName       String?
  name           String    // Company name
  subdomain      String    @unique
  
  // Remove single plan - tenants don't have plans anymore
  // plan           Plan     // REMOVE THIS
  
  // Relations
  chatbots       Chatbot[]  // ADD THIS - one tenant, many bots
  aiConfig       AIConfig?
  integration    Integration?
  usageStats     UsageStats[]
  
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  @@schema("saas")
}
```

---

## 🔌 API Endpoints

### Chatbot CRUD

```typescript
// Create new bot (after payment)
POST   /chatbots
Body: {
  name: "Sales Bot",
  type: "BASIC" | "PREMIUM"
}
Response: {
  id: "uuid",
  chatId: "bot_abc123",
  status: "PENDING_PAYMENT"
}

// List tenant's bots
GET    /chatbots
Response: [
  {
    id: "uuid",
    name: "Sales Bot",
    type: "PREMIUM",
    status: "ACTIVE",
    webhookUrl: "https://n8n.../webhook/bot_abc123"
  }
]

// Get single bot
GET    /chatbots/:id
Response: { ... full bot details ... }

// Update bot config
PUT    /chatbots/:id
Body: {
  name: "New Name",
  config: { ... widget settings ... }
}

// Delete bot (soft delete)
DELETE /chatbots/:id

// Purchase bot (dummy payment for now)
POST   /chatbots/:id/purchase
Body: {
  paymentMethod: "credit_card" // dummy
}
Response: {
  success: true,
  bot: { ...status: "ACTIVE"... }
}
```

---

## 🎨 Dashboard UI Flow

### Empty State

```tsx
<div className="empty-state">
  <BotIcon />
  <h2>You don't have any chatbots yet</h2>
  <p>Create your first chatbot to get started</p>
  <Button onClick={openCreateModal}>+ Create Your First Bot</Button>
</div>
```

### Bot List

```tsx
<div className="bot-grid">
  {bots.map(bot => (
    <BotCard key={bot.id}>
      <Badge variant={bot.type}>{bot.type}</Badge>
      <h3>{bot.name}</h3>
      <Status status={bot.status} />
      <Button onClick={() => navigate(`/bots/${bot.id}`)}>
        Configure
      </Button>
    </BotCard>
  ))}
  
  <AddBotCard onClick={openCreateModal}>
    <PlusIcon />
    <span>Create New Bot</span>
  </AddBotCard>
</div>
```

### Create Bot Modal

```tsx
<Modal>
  <h2>Create New Chatbot</h2>
  
  <Input
    label="Bot Name"
    placeholder="Sales Bot"
    value={botName}
    onChange={setBotName}
  />
  
  <RadioGroup value={botType} onChange={setBotType}>
    <Radio value="BASIC">
      <span>Basic - $9.99/month</span>
      <small>AI-only chat widget</small>
    </Radio>
    
    <Radio value="PREMIUM">
      <span>Premium - $19.99/month</span>
      <small>AI + Live Support tabs</small>
    </Radio>
  </RadioGroup>
  
  <Button onClick={handleContinueToPayment}>
    Continue to Payment →
  </Button>
</Modal>
```

---

## 🔄 Flow Diagram

```
┌─────────────────────────────────────────┐
│ 1. Tenant Signs Up                      │
│    - Email, Password, Company           │
│    - NO plan selection                  │
│    - NO bot created                     │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 2. Dashboard Login                      │
│    URL: acme.simplechat.bot             │
│    Sees: Empty state                    │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 3. Click "+ Create Bot"                 │
│    - Enter bot name                     │
│    - Select BASIC or PREMIUM            │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 4. Payment Page (Dummy)                 │
│    - Show selected plan price           │
│    - [Purchase Bot] button              │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 5. Backend: POST /chatbots/:id/purchase │
│    - Create bot record                  │
│    - Clone N8N workflow                 │
│    - Update status: ACTIVE              │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│ 6. Bot Active!                          │
│    - Configure widget                   │
│    - Get embed code                     │
│    - Use on website                     │
└─────────────────────────────────────────┘
```

---

## ⚡ Key Changes from Previous Design

| Previous (1 Bot Per Tenant) | New (Multi-Bot) |
|-----------------------------|-----------------|
| Plan chosen at signup | No plan at signup |
| 1 tenant = 1 bot | 1 tenant = unlimited bots |
| chatId in Tenant table | chatId in Chatbot table |
| Plan in Tenant table | type in Chatbot table |
| N8N cloned at signup | N8N cloned at bot purchase |
| TenantWorkflow model | Merged into Chatbot model |

---

## 🚀 Implementation Steps

1. ✅ Update MD files with new architecture
2. ⏳ Update Prisma schema (add Chatbot model)
3. ⏳ Run migration
4. ⏳ Remove bot creation from Auth service
5. ⏳ Create Chatbot CRUD service
6. ⏳ Create dummy purchase endpoint
7. ⏳ Update N8N service (per-bot workflow)
8. ⏳ Build dashboard UI

---

