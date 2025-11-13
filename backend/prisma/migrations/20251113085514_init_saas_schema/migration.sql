-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "saas";

-- CreateEnum
CREATE TYPE "saas"."WidgetType" AS ENUM ('NORMAL', 'PREMIUM');

-- CreateEnum
CREATE TYPE "saas"."DeploymentStatus" AS ENUM ('PENDING', 'DEPLOYING', 'ACTIVE', 'FAILED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "saas"."TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "saas"."Plan" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'STARTER', 'PRO', 'ENTERPRISE');

-- CreateTable
CREATE TABLE "saas"."Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "widgetType" "saas"."WidgetType" NOT NULL DEFAULT 'NORMAL',
    "railwayServiceId" TEXT,
    "deploymentUrl" TEXT,
    "deploymentStatus" "saas"."DeploymentStatus" NOT NULL DEFAULT 'PENDING',
    "config" JSONB NOT NULL,
    "plan" "saas"."Plan" NOT NULL DEFAULT 'FREE',
    "status" "saas"."TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "email" TEXT,
    "passwordHash" TEXT,
    "fullName" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "authProvider" TEXT DEFAULT 'email',
    "googleId" TEXT,
    "googleRefreshToken" TEXT,
    "avatarUrl" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "chatId" TEXT,
    "iyzicoCustomerId" TEXT,
    "iyzicoSubscriptionId" TEXT,
    "subscriptionStatus" TEXT DEFAULT 'trialing',
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas"."Widget" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "embedCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Widget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas"."User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas"."Message" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "humanMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas"."Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "humanMode" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas"."WidgetOpen" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "host" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WidgetOpen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas"."TenantWorkflow" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "n8nWorkflowId" TEXT NOT NULL,
    "n8nWorkflowName" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clonedFromTemplateId" TEXT,
    "lastExecutedAt" TIMESTAMP(3),
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas"."Integration" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "telegramMode" TEXT DEFAULT 'managed',
    "telegramGroupId" TEXT,
    "telegramBotToken" TEXT,
    "usesSharedBot" BOOLEAN NOT NULL DEFAULT false,
    "businessHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT DEFAULT 'Europe/Istanbul',
    "businessDays" TEXT[],
    "startTime" TEXT,
    "endTime" TEXT,
    "outOfHoursMessage" TEXT,
    "slackWebhookUrl" TEXT,
    "discordWebhookUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas"."TelegramTopic" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" INTEGER NOT NULL,
    "topicName" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas"."AIConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "aiInstructions" TEXT NOT NULL DEFAULT 'You are a helpful customer support assistant.',
    "aiModel" TEXT NOT NULL DEFAULT 'gpt-4o',
    "aiTemperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "aiMaxTokens" INTEGER NOT NULL DEFAULT 500,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "qdrantCollectionName" TEXT,
    "websiteCrawlEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastCrawlAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saas"."UsageStats" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "aiMessageCount" INTEGER NOT NULL DEFAULT 0,
    "humanMessageCount" INTEGER NOT NULL DEFAULT 0,
    "userCount" INTEGER NOT NULL DEFAULT 0,
    "widgetOpensCount" INTEGER NOT NULL DEFAULT 0,
    "aiTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "estimatedCostUsd" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_subdomain_key" ON "saas"."Tenant"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_apiKey_key" ON "saas"."Tenant"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_email_key" ON "saas"."Tenant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_googleId_key" ON "saas"."Tenant"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_chatId_key" ON "saas"."Tenant"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_iyzicoCustomerId_key" ON "saas"."Tenant"("iyzicoCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_iyzicoSubscriptionId_key" ON "saas"."Tenant"("iyzicoSubscriptionId");

-- CreateIndex
CREATE INDEX "Tenant_subdomain_idx" ON "saas"."Tenant"("subdomain");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "saas"."Tenant"("status");

-- CreateIndex
CREATE INDEX "Tenant_email_idx" ON "saas"."Tenant"("email");

-- CreateIndex
CREATE INDEX "Tenant_chatId_idx" ON "saas"."Tenant"("chatId");

-- CreateIndex
CREATE INDEX "Tenant_iyzicoCustomerId_idx" ON "saas"."Tenant"("iyzicoCustomerId");

-- CreateIndex
CREATE INDEX "Widget_tenantId_idx" ON "saas"."Widget"("tenantId");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "saas"."User"("tenantId");

-- CreateIndex
CREATE INDEX "User_lastSeenAt_idx" ON "saas"."User"("lastSeenAt");

-- CreateIndex
CREATE INDEX "Message_userId_idx" ON "saas"."Message"("userId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "saas"."Message"("createdAt");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "saas"."Session"("userId");

-- CreateIndex
CREATE INDEX "Session_startTime_idx" ON "saas"."Session"("startTime");

-- CreateIndex
CREATE INDEX "WidgetOpen_userId_idx" ON "saas"."WidgetOpen"("userId");

-- CreateIndex
CREATE INDEX "WidgetOpen_createdAt_idx" ON "saas"."WidgetOpen"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TenantWorkflow_n8nWorkflowId_key" ON "saas"."TenantWorkflow"("n8nWorkflowId");

-- CreateIndex
CREATE INDEX "TenantWorkflow_tenantId_idx" ON "saas"."TenantWorkflow"("tenantId");

-- CreateIndex
CREATE INDEX "TenantWorkflow_n8nWorkflowId_idx" ON "saas"."TenantWorkflow"("n8nWorkflowId");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_tenantId_key" ON "saas"."Integration"("tenantId");

-- CreateIndex
CREATE INDEX "TelegramTopic_tenantId_userId_idx" ON "saas"."TelegramTopic"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "TelegramTopic_tenantId_isArchived_lastMessageAt_idx" ON "saas"."TelegramTopic"("tenantId", "isArchived", "lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramTopic_tenantId_userId_key" ON "saas"."TelegramTopic"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AIConfig_tenantId_key" ON "saas"."AIConfig"("tenantId");

-- CreateIndex
CREATE INDEX "UsageStats_tenantId_month_idx" ON "saas"."UsageStats"("tenantId", "month");

-- CreateIndex
CREATE UNIQUE INDEX "UsageStats_tenantId_month_key" ON "saas"."UsageStats"("tenantId", "month");

-- AddForeignKey
ALTER TABLE "saas"."Widget" ADD CONSTRAINT "Widget_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "saas"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas"."User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "saas"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas"."Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "saas"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "saas"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas"."WidgetOpen" ADD CONSTRAINT "WidgetOpen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "saas"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas"."TenantWorkflow" ADD CONSTRAINT "TenantWorkflow_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "saas"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas"."Integration" ADD CONSTRAINT "Integration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "saas"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas"."TelegramTopic" ADD CONSTRAINT "TelegramTopic_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "saas"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas"."AIConfig" ADD CONSTRAINT "AIConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "saas"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas"."UsageStats" ADD CONSTRAINT "UsageStats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "saas"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
