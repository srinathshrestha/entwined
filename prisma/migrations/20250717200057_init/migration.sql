-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "MemoryType" AS ENUM ('PERSONALITY_TRAIT', 'PREFERENCE', 'RELATIONSHIP_FACT', 'SHARED_EXPERIENCE', 'CONVERSATION_CONTEXT', 'EMOTIONAL_STATE', 'BEHAVIORAL_PATTERN', 'FUTURE_PLAN', 'CHARACTER_DISCOVERY', 'RELATIONSHIP_MILESTONE');

-- CreateEnum
CREATE TYPE "MemorySource" AS ENUM ('CHAT_MESSAGE', 'USER_PROFILE', 'COMPANION_PROFILE', 'RELATIONSHIP_DYNAMIC', 'SYSTEM_INFERENCE', 'USER_INPUT', 'EDIT_MESSAGE');

-- CreateEnum
CREATE TYPE "RelationshipStatus" AS ENUM ('JUST_MET', 'EARLY_DATING', 'COMMITTED', 'LIVING_TOGETHER', 'MARRIED');

-- CreateEnum
CREATE TYPE "DeletedBy" AS ENUM ('USER', 'SYSTEM', 'AUTO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT,
    "age" INTEGER,
    "location" TEXT,
    "occupation" TEXT,
    "primaryTraits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "quirks" JSONB,
    "deepPersonality" JSONB,
    "lifestyle" JSONB,
    "cultural" JSONB,
    "philosophy" JSONB,
    "professionalLife" JSONB,
    "personalLife" JSONB,
    "additionalContext" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "location" TEXT,
    "occupation" TEXT,
    "primaryTraits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "quirks" JSONB,
    "deepPersonality" JSONB,
    "lifestyle" JSONB,
    "cultural" JSONB,
    "philosophy" JSONB,
    "professionalLife" JSONB,
    "personalLife" JSONB,
    "additionalContext" JSONB,
    "communicationStyle" JSONB,
    "personalityTowardsUser" JSONB,

    CONSTRAINT "companions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relationship_dynamics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "RelationshipStatus" NOT NULL,
    "relationshipLength" TEXT,
    "originStory" JSONB,
    "currentSituation" JSONB,
    "communication" JSONB,
    "intimacy" JSONB,
    "roles" JSONB,
    "sharedWorld" JSONB,
    "memorableMoments" JSONB,
    "contentBoundaries" JSONB,

    CONSTRAINT "relationship_dynamics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "userMessages" INTEGER NOT NULL DEFAULT 0,
    "aiMessages" INTEGER NOT NULL DEFAULT 0,
    "deletedMessages" INTEGER NOT NULL DEFAULT 0,
    "editedMessages" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "replyToId" TEXT,
    "hasReplies" BOOLEAN NOT NULL DEFAULT false,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editCount" INTEGER NOT NULL DEFAULT 0,
    "editHistory" JSONB,
    "originalContent" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" "DeletedBy",
    "deleteReason" TEXT,
    "hasGeneratedMemory" BOOLEAN NOT NULL DEFAULT false,
    "memoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "memoryCount" INTEGER NOT NULL DEFAULT 0,
    "wordCount" INTEGER,
    "characterCount" INTEGER,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "sentiment" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "type" "MemoryType" NOT NULL,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "importance" INTEGER NOT NULL DEFAULT 5,
    "vectorId" TEXT,
    "embeddingMeta" JSONB,
    "sourceType" "MemorySource" NOT NULL,
    "sourceMessageId" TEXT,
    "sourceData" JSONB,
    "conversationContext" JSONB,
    "relationshipContext" JSONB,
    "emotionalContext" JSONB,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isEditable" BOOLEAN NOT NULL DEFAULT false,
    "isSystemGenerated" BOOLEAN NOT NULL DEFAULT true,
    "userNotes" TEXT,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessed" TIMESTAMP(3),
    "usefulness" DOUBLE PRECISION,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_sessions" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "userMessages" INTEGER NOT NULL DEFAULT 0,
    "aiMessages" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "memoriesCreated" INTEGER NOT NULL DEFAULT 0,
    "memoriesAccessed" INTEGER NOT NULL DEFAULT 0,
    "memoryQuality" DOUBLE PRECISION,
    "messagesEdited" INTEGER NOT NULL DEFAULT 0,
    "messagesDeleted" INTEGER NOT NULL DEFAULT 0,
    "repliesUsed" INTEGER NOT NULL DEFAULT 0,
    "userSatisfaction" INTEGER,
    "sessionRating" TEXT,
    "feedbackNotes" TEXT,

    CONSTRAINT "conversation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chatSettings" JSONB,
    "memoryRetention" INTEGER NOT NULL DEFAULT 90,
    "memoryImportanceThreshold" INTEGER NOT NULL DEFAULT 3,
    "autoMemoryDeletion" BOOLEAN NOT NULL DEFAULT false,
    "memoryPrivacyLevel" TEXT NOT NULL DEFAULT 'balanced',
    "responseStyle" TEXT NOT NULL DEFAULT 'adaptive',
    "responseLength" TEXT NOT NULL DEFAULT 'medium',
    "creativityLevel" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "emotionalDepth" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "memoryReference" TEXT NOT NULL DEFAULT 'natural',
    "dataRetentionDays" INTEGER NOT NULL DEFAULT 365,
    "allowDataExport" BOOLEAN NOT NULL DEFAULT true,
    "allowAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "contentFiltering" TEXT NOT NULL DEFAULT 'moderate',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT false,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "reminderNotifications" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_metrics" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(3) NOT NULL,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "totalConversations" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "totalMemories" INTEGER NOT NULL DEFAULT 0,
    "avgSessionDuration" DOUBLE PRECISION,
    "avgMessagesPerSession" DOUBLE PRECISION,
    "avgMemoriesPerUser" DOUBLE PRECISION,
    "userRetentionRate" DOUBLE PRECISION,
    "avgResponseTime" DOUBLE PRECISION,
    "memoryRetrievalTime" DOUBLE PRECISION,
    "errorRate" DOUBLE PRECISION,

    CONSTRAINT "system_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "relationship_dynamics_userId_key" ON "relationship_dynamics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "relationship_dynamics_companionId_key" ON "relationship_dynamics"("companionId");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_conversationId_role_idx" ON "messages"("conversationId", "role");

-- CreateIndex
CREATE INDEX "messages_conversationId_isDeleted_idx" ON "messages"("conversationId", "isDeleted");

-- CreateIndex
CREATE INDEX "messages_replyToId_idx" ON "messages"("replyToId");

-- CreateIndex
CREATE INDEX "memories_userId_type_idx" ON "memories"("userId", "type");

-- CreateIndex
CREATE INDEX "memories_userId_importance_idx" ON "memories"("userId", "importance");

-- CreateIndex
CREATE INDEX "memories_vectorId_idx" ON "memories"("vectorId");

-- CreateIndex
CREATE INDEX "memories_sourceMessageId_idx" ON "memories"("sourceMessageId");

-- CreateIndex
CREATE INDEX "memories_userId_createdAt_idx" ON "memories"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "conversation_sessions_userId_startedAt_idx" ON "conversation_sessions"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "conversation_sessions_conversationId_idx" ON "conversation_sessions"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "system_metrics_date_key" ON "system_metrics"("date");

-- AddForeignKey
ALTER TABLE "companions" ADD CONSTRAINT "companions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationship_dynamics" ADD CONSTRAINT "relationship_dynamics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationship_dynamics" ADD CONSTRAINT "relationship_dynamics_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "companions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "companions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
