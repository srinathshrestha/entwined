# Design - Entwined AI Romantic Companion App

## Architecture Overview

### **Three-Layer Application Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│ PRESENTATION LAYER (Next.js Frontend)                          │
│  ├── Pages: Landing, Auth, Dashboard, Chat, Profile            │
│  ├── Components: UI Elements, Forms, Chat Interface            │
│  ├── State: React State, Form State, Real-time State           │
│  └── Routing: App Router with dynamic routes                   │
├─────────────────────────────────────────────────────────────────┤
│ APPLICATION LAYER (Next.js API Routes)                         │
│  ├── Auth: Clerk integration, session management               │
│  ├── Chat: Message processing, AI generation, branching        │
│  ├── Memory: Extraction, storage, retrieval, search            │
│  ├── Profile: CRUD operations, validation, avatar management   │
│  └── WebSocket: Real-time features (optional for MVP)          │
├─────────────────────────────────────────────────────────────────┤
│ DATA LAYER (Multi-Database Strategy)                           │
│  ├── PostgreSQL: Structured data (profiles, messages, memory)  │
│  ├── Pinecone: Vector embeddings (semantic memory search)      │
│  └── Redis: Session cache, real-time state (optional MVP)      │
└─────────────────────────────────────────────────────────────────┘
```

### **Data Architecture Strategy**

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 1: CHARACTER & RELATIONSHIP DATA (PostgreSQL)            │
│  • User Profile (psychological patterns, traits)               │
│  • Companion Profile (behavioral design, avatar)               │
│  • Relationship Dynamics (conditional context, history)        │
│  └─ FOUNDATION - Changes only via profile editing              │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 2: CONVERSATION DATA (PostgreSQL)                        │
│  • Chat Messages (content, replies, edits, deletions)          │
│  • Message Threading and Branching                             │
│  • Conversation Sessions with analytics                        │
│  └─ STRUCTURED HISTORY - Independent of memories               │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 3: SEMANTIC MEMORY (PostgreSQL + Pinecone)               │
│  • Memory Metadata (PostgreSQL): type, importance, context     │
│  • Vector Embeddings (Pinecone): semantic search capability    │
│  • User Namespaces: complete isolation per user                │
│  └─ AI-CONTROLLED - Independent of chat deletion               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### **Frontend Technologies**

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.3+
- **Components**: Shadcn/ui (Radix UI + Tailwind)
- **Animations**: Framer Motion 10+
- **Forms**: React Hook Form 7+ + Zod validation
- **State Management**: React useState/useReducer + Context API
- **Real-time**: WebSocket (or polling fallback for MVP)

### **Backend Technologies**

- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes (App Router)
- **Authentication**: Clerk
- **Database ORM**: Prisma 5+
- **Validation**: Zod schemas
- **AI Integration**: Vercel AI SDK 3+

### **Databases & Services**

- **Primary Database**: Neon PostgreSQL
- **Vector Database**: Pinecone (Serverless)
- **Cache**: Upstash Redis _(Optional for MVP)_
- **Authentication**: Clerk
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network

### **AI & ML Services**

- **Primary LLM**: Grok-3-mini (XAI API)
- **Embeddings**: llama-text-embed-v2 (Pinecone)
- **Memory Search**: Custom semantic search with Pinecone
- **Fallback LLM**: OpenAI GPT-4 (if needed)

---

## Component Architecture

### **Directory Structure**

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/
│   │   ├── sign-in/page.tsx          ✅ Implemented
│   │   └── sign-up/page.tsx          ✅ Implemented
│   ├── dashboard/page.tsx            ✅ Basic implementation
│   ├── chat/page.tsx                 ✅ Basic implementation
│   ├── onboarding/
│   │   ├── page.tsx                  ✅ Step 1 implemented
│   │   ├── psychology/page.tsx       ❌ Missing
│   │   ├── companion/page.tsx        ❌ Missing
│   │   ├── relationship/page.tsx     ❌ Missing
│   │   └── avatar/page.tsx          ❌ Missing
│   ├── profile/
│   │   ├── page.tsx                  ❌ Missing
│   │   ├── user/page.tsx            ❌ Missing
│   │   ├── companion/page.tsx        ❌ Missing
│   │   └── relationship/page.tsx     ❌ Missing
│   ├── memories/page.tsx             ❌ Missing
│   ├── api/                          # API Routes
│   │   ├── auth/                     ✅ Clerk integration
│   │   ├── onboarding/
│   │   │   ├── basic/route.ts        ✅ Implemented
│   │   │   ├── psychology/route.ts   ❌ Missing
│   │   │   ├── companion/route.ts    ❌ Missing
│   │   │   └── relationship/route.ts ❌ Missing
│   │   ├── chat/
│   │   │   ├── route.ts              ✅ Basic implementation
│   │   │   ├── messages/route.ts     ❌ Missing
│   │   │   ├── reply/route.ts        ❌ Missing
│   │   │   ├── edit/route.ts         ❌ Missing
│   │   │   └── delete/route.ts       ❌ Missing
│   │   ├── memories/
│   │   │   ├── route.ts              ❌ Missing
│   │   │   ├── search/route.ts       ❌ Missing
│   │   │   └── delete/route.ts       ❌ Missing
│   │   └── profile/
│   │       ├── user/route.ts         ❌ Missing
│   │       ├── companion/route.ts    ❌ Missing
│   │       └── relationship/route.ts ❌ Missing
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                      # Landing page
├── components/
│   ├── ui/                           ✅ Shadcn components
│   ├── auth/                         ✅ Auth components
│   ├── onboarding/
│   │   ├── BasicDetailsForm.tsx      ✅ Implemented
│   │   ├── PsychologyForm.tsx        ❌ Missing
│   │   ├── CompanionDesignForm.tsx   ❌ Missing
│   │   ├── RelationshipForm.tsx      ❌ Missing
│   │   ├── AvatarSelector.tsx        ❌ Missing
│   │   └── ProgressIndicator.tsx     ❌ Missing
│   ├── chat/
│   │   ├── ChatInterface.tsx         ❌ Missing
│   │   ├── MessageList.tsx           ❌ Missing
│   │   ├── MessageBubble.tsx         ❌ Missing
│   │   ├── MessageInput.tsx          ❌ Missing
│   │   ├── ReplySystem.tsx           ❌ Missing
│   │   ├── EditBranching.tsx         ❌ Missing
│   │   ├── MessageActions.tsx        ❌ Missing
│   │   └── TypingIndicator.tsx       ❌ Missing
│   ├── profile/
│   │   ├── ProfileEditor.tsx         ❌ Missing
│   │   ├── UserProfileForm.tsx       ❌ Missing
│   │   ├── CompanionProfileForm.tsx  ❌ Missing
│   │   ├── RelationshipEditor.tsx    ❌ Missing
│   │   └── AvatarChanger.tsx         ❌ Missing
│   ├── memory/
│   │   ├── MemoryDashboard.tsx       ❌ Missing
│   │   ├── MemoryList.tsx            ❌ Missing
│   │   ├── MemoryCard.tsx            ❌ Missing
│   │   ├── MemorySearch.tsx          ❌ Missing
│   │   ├── MemoryFilters.tsx         ❌ Missing
│   │   └── MemoryCategories.tsx      ❌ Missing
│   └── layout/
│       ├── Navigation.tsx            ❌ Missing
│       ├── Header.tsx                ❌ Missing
│       ├── Sidebar.tsx               ❌ Missing
│       └── MobileNav.tsx             ❌ Missing
├── lib/
│   ├── db.ts                         ✅ Prisma client
│   ├── auth.ts                       ✅ Clerk configuration
│   ├── ai/
│   │   ├── grok.ts                   ❌ Missing
│   │   ├── memory-extraction.ts      ❌ Missing
│   │   ├── context-assembly.ts       ❌ Missing
│   │   └── behavioral-framework.ts   ❌ Missing
│   ├── pinecone/
│   │   ├── client.ts                 ❌ Missing
│   │   ├── memory-storage.ts         ❌ Missing
│   │   └── semantic-search.ts        ❌ Missing
│   ├── redis/
│   │   ├── client.ts                 ❌ Missing (optional)
│   │   └── session-cache.ts          ❌ Missing (optional)
│   ├── validation/
│   │   ├── onboarding.ts             ✅ Partial
│   │   ├── chat.ts                   ❌ Missing
│   │   ├── profile.ts                ❌ Missing
│   │   └── memory.ts                 ❌ Missing
│   └── utils.ts                      ✅ Basic utilities
├── types/
│   ├── auth.ts                       ✅ Auth types
│   ├── onboarding.ts                 ✅ Partial
│   ├── chat.ts                       ❌ Missing
│   ├── memory.ts                     ❌ Missing
│   ├── profile.ts                    ❌ Missing
│   └── api.ts                        ❌ Missing
└── prisma/
    ├── schema.prisma                 ✅ Basic schema
    └── migrations/                   ✅ Initial migrations
```

---

## Database Schema (Detailed)

### **Complete Prisma Schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// USER MANAGEMENT & AUTHENTICATION
// ============================================================================

model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Basic Profile (Required for MVP)
  name       String?
  age        Int?
  location   String?
  occupation String?

  // Psychology Profile (Optional, JSON structure)
  psychologyProfile Json? // UserPsychology interface

  // Onboarding Progress Tracking
  onboardingCompleted Boolean @default(false)
  currentStep         String  @default("basic") // basic, psychology, companion, relationship, avatar
  stepsCompleted      String[] @default([])

  // Relations
  companions    Companion[]
  conversations Conversation[]
  memories      Memory[]
  preferences   UserPreferences?

  @@index([clerkId])
  @@index([email])
  @@map("users")
}

// ============================================================================
// AI COMPANION CHARACTER
// ============================================================================

model Companion {
  id         String @id @default(cuid())
  userId     String
  name       String
  gender     String // 'male' | 'female' | 'non-binary'
  age        Int
  location   String?
  occupation String?

  // Avatar System
  avatarUrl       String? // Selected avatar URL
  avatarCategory  String? // casual, professional, artistic

  // Behavioral Design (from onboarding)
  behavioralDesign Json? // PartnerDesign interface

  // Character Consistency Tracking
  personalityVersion Int @default(1) // Increment when behavioral design changes

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user                User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  conversations       Conversation[]
  relationshipDynamic RelationshipDynamic?

  @@index([userId])
  @@map("companions")
}

// ============================================================================
// RELATIONSHIP DYNAMICS & CONTEXT
// ============================================================================

model RelationshipDynamic {
  id          String            @id @default(cuid())
  userId      String            @unique
  companionId String            @unique

  // Relationship Status
  status RelationshipStatus

  // Conditional Context (based on status)
  relationshipHistory Json? // RelationshipHistory or EarlyRelationship interface

  // Content Boundaries
  contentBoundaries Json? // User-defined content limits

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  companion Companion @relation(fields: [companionId], references: [id], onDelete: Cascade)

  @@map("relationship_dynamics")
}

// ============================================================================
// CONVERSATION MANAGEMENT
// ============================================================================

model Conversation {
  id          String @id @default(cuid())
  userId      String
  companionId String

  // Conversation Metadata
  title        String?   @default("Chat")
  isActive     Boolean   @default(true)
  lastActivity DateTime  @default(now())

  // Message Statistics
  messageCount    Int @default(0)
  userMessages    Int @default(0)
  aiMessages      Int @default(0)
  deletedMessages Int @default(0)
  editedMessages  Int @default(0)

  // Conversation Branches (for message editing)
  branches Json? // Track conversation branch structure

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  companion Companion @relation(fields: [companionId], references: [id], onDelete: Cascade)
  messages  Message[]

  @@index([userId])
  @@index([companionId])
  @@index([lastActivity])
  @@map("conversations")
}

// ============================================================================
// MESSAGE SYSTEM (WITH ADVANCED FEATURES)
// ============================================================================

model Message {
  id             String      @id @default(cuid())
  conversationId String
  content        String      @db.Text
  role           MessageRole

  // Reply System
  replyToId   String?
  hasReplies  Boolean @default(false)
  replyDepth  Int     @default(0) // For nested reply threading

  // Edit & Branching System
  isEdited     Boolean @default(false)
  editCount    Int     @default(0)
  editHistory  Json?   // Array of {content, editedAt, branchId}
  branchId     String? @default("main") // Conversation branch identifier
  originalContent String? @db.Text // Store original content

  // Delete System (independent of memories)
  isDeleted   Boolean   @default(false)
  deletedAt   DateTime?
  deletedBy   DeletedBy? // USER or SYSTEM
  deleteReason String?   // Reason for deletion

  // Message Metadata
  wordCount      Int?     // For analytics
  characterCount Int?     // For analytics
  sentiment      String?  // positive, negative, neutral
  isImportant    Boolean  @default(false) // User can mark important

  // Memory Association Tracking (for debugging, not functionality)
  memoryGenerated Boolean @default(false) // Whether this message generated memories
  memoryCount     Int     @default(0)     // How many memories generated

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  replyTo      Message?     @relation("MessageReplies", fields: [replyToId], references: [id])
  replies      Message[]    @relation("MessageReplies")

  // Indexes for Performance
  @@index([conversationId, createdAt])
  @@index([conversationId, branchId])
  @@index([conversationId, isDeleted])
  @@index([replyToId])
  @@map("messages")
}

// ============================================================================
// MEMORY SYSTEM (INDEPENDENT OF CHAT)
// ============================================================================

model Memory {
  id      String     @id @default(cuid())
  userId  String
  content String     @db.Text
  summary String?    // Brief summary for UI display
  type    MemoryType

  // Memory Classification
  category   String? // "personality", "preference", "relationship", "life_event"
  tags       String[] @default([]) // Searchable tags
  importance Int      @default(5)   // 1-10 importance scale

  // Vector Database Integration
  vectorId      String? // Pinecone vector ID
  embeddingMeta Json?   // Embedding metadata

  // Context (without direct message linking)
  conversationContext Json?   // General context when created
  emotionalContext    String? // Emotional state when memory formed
  temporalContext     Json?   // Time, date, season when created

  // User Control
  isVisible     Boolean @default(true)  // User can see this memory
  isEditable    Boolean @default(false) // User can edit this memory
  userCreated   Boolean @default(false) // AI vs user created
  userNotes     String? // User can add notes

  // Memory Usage Statistics
  accessCount   Int       @default(0) // How often referenced in AI responses
  lastAccessed  DateTime? // When last used in response
  usefulness    Float?    // AI feedback on memory utility (0.0-1.0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Indexes for Performance
  @@index([userId, type])
  @@index([userId, importance])
  @@index([userId, category])
  @@index([vectorId])
  @@index([userId, createdAt])
  @@index([userId, isVisible])
  @@map("memories")
}

// ============================================================================
// USER PREFERENCES & SETTINGS
// ============================================================================

model UserPreferences {
  id     String @id @default(cuid())
  userId String @unique

  // Chat Preferences
  enableTypingIndicators Boolean @default(true)
  enableNotifications    Boolean @default(true)
  chatTheme             String  @default("default") // light, dark, auto
  messageTimestamps      Boolean @default(true)
  soundEffects          Boolean @default(false)

  // Memory Preferences
  memoryRetentionDays       Int     @default(365)    // Days to keep memories
  memoryImportanceThreshold Int     @default(3)      // Minimum importance to store
  autoMemoryDeletion        Boolean @default(false)  // Auto-delete old memories
  memoryPrivacyLevel        String  @default("balanced") // strict, balanced, open

  // AI Behavior Settings
  responseStyle     String @default("adaptive") // adaptive, consistent, varied
  responseLength    String @default("medium")   // short, medium, long, adaptive
  creativityLevel   Float  @default(0.7)        // 0.0 to 1.0
  emotionalDepth    Float  @default(0.8)        // How emotionally expressive
  memoryReference   String @default("natural")  // natural, frequent, minimal

  // Privacy & Safety
  dataRetentionDays   Int     @default(365)  // How long to keep data
  allowDataExport     Boolean @default(true)
  allowAnalytics      Boolean @default(true)
  contentFiltering    String  @default("moderate") // strict, moderate, minimal

  // Notification Preferences
  emailNotifications    Boolean @default(false)
  pushNotifications     Boolean @default(true)
  reminderNotifications Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_preferences")
}

// ============================================================================
// ANALYTICS & SESSION TRACKING
// ============================================================================

model ConversationSession {
  id             String @id @default(cuid())
  conversationId String
  userId         String
  startedAt      DateTime @default(now())
  endedAt        DateTime?

  // Session Metrics
  messageCount  Int @default(0)
  userMessages  Int @default(0)
  aiMessages    Int @default(0)
  duration      Int? // in seconds

  // Memory Activity
  memoriesCreated  Int @default(0) // New memories from this session
  memoriesAccessed Int @default(0) // Memories retrieved for context
  memoryQuality    Float? // Quality score of generated memories

  // User Engagement
  messagesEdited  Int @default(0)
  messagesDeleted Int @default(0)
  repliesUsed     Int @default(0)
  branchesCreated Int @default(0)

  // Session Quality
  userSatisfaction Int?    // 1-5 rating if collected
  sessionRating    String? // "good", "great", "poor"
  feedbackNotes    String? // User feedback

  // Relations
  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([userId, startedAt])
  @@index([conversationId])
  @@map("conversation_sessions")
}

// ============================================================================
// ENUMS
// ============================================================================

enum MessageRole {
  USER
  ASSISTANT
}

enum MemoryType {
  // User characteristics
  PERSONALITY_TRAIT
  BEHAVIORAL_PATTERN
  EMOTIONAL_TRIGGER

  // User preferences
  PREFERENCE
  INTEREST
  DISLIKE

  // Relationship information
  RELATIONSHIP_DYNAMIC
  SHARED_EXPERIENCE
  INTIMATE_MOMENT
  CONFLICT_RESOLUTION

  // Life context
  LIFE_EVENT
  FAMILY_INFO
  CAREER_INFO

  // Future-oriented
  GOAL
  FEAR
  DREAM
}

enum RelationshipStatus {
  JUST_MET
  EARLY_DATING
  COMMITTED
  LIVING_TOGETHER
  MARRIED
}

enum DeletedBy {
  USER
  SYSTEM
}
```

---

## AI Integration Strategy

### **Grok-3-mini Integration**

```typescript
// lib/ai/grok.ts
import OpenAI from "openai";

const grokClient = new OpenAI({
  apiKey: process.env.XAI_API_KEY!,
  baseURL: "https://api.x.ai/v1",
});

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function generateResponse(
  messages: Array<{ role: string; content: string }>,
  options: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  } = {}
): Promise<AIResponse> {
  try {
    const completion = await grokClient.chat.completions.create({
      model: "grok-3-mini",
      messages,
      temperature: options.temperature ?? 0.8,
      max_tokens: options.maxTokens ?? 1000,
      stream: options.stream ?? false,
    });

    return {
      content: completion.choices[0]?.message?.content ?? "",
      usage: {
        promptTokens: completion.usage?.prompt_tokens ?? 0,
        completionTokens: completion.usage?.completion_tokens ?? 0,
        totalTokens: completion.usage?.total_tokens ?? 0,
      },
    };
  } catch (error) {
    console.error("Grok API Error:", error);
    throw new Error("Failed to generate AI response");
  }
}
```

### **Memory Extraction System**

```typescript
// lib/ai/memory-extraction.ts
import { MemoryType } from "@prisma/client";

export interface ExtractedMemory {
  content: string;
  type: MemoryType;
  importance: number; // 1-10
  category: string;
  tags: string[];
  emotionalContext?: string;
}

export async function extractMemories(
  userMessage: string,
  aiResponse: string,
  conversationContext: any[]
): Promise<ExtractedMemory[]> {
  const extractionPrompt = `
Analyze this conversation and extract important memories about the user.
Focus on: personality traits, preferences, life events, relationship dynamics, goals, and behavioral patterns.

User Message: "${userMessage}"
AI Response: "${aiResponse}"
Recent Context: ${JSON.stringify(conversationContext.slice(-5))}

Extract memories in this JSON format:
{
  "memories": [
    {
      "content": "Brief description of the memory",
      "type": "PERSONALITY_TRAIT|PREFERENCE|LIFE_EVENT|etc",
      "importance": 1-10,
      "category": "personality|preference|relationship|life_event",
      "tags": ["tag1", "tag2"],
      "emotionalContext": "emotional state when this was shared"
    }
  ]
}

Only extract NEW or UPDATED information. Don't repeat existing memories.
`;

  try {
    const response = await generateResponse(
      [
        { role: "system", content: extractionPrompt },
        { role: "user", content: "Extract memories from this conversation." },
      ],
      { temperature: 0.3, maxTokens: 500 }
    );

    const parsed = JSON.parse(response.content);
    return parsed.memories || [];
  } catch (error) {
    console.error("Memory extraction failed:", error);
    return [];
  }
}
```

### **Behavioral Framework**

```typescript
// lib/ai/behavioral-framework.ts
export interface BehavioralContext {
  userPsychology: any;
  companionBehavior: any;
  relationshipDynamic: any;
  emotionalState: string;
  recentMemories: any[];
}

export function buildContextualPrompt(
  context: BehavioralContext,
  userMessage: string
): string {
  const {
    userPsychology,
    companionBehavior,
    relationshipDynamic,
    emotionalState,
    recentMemories,
  } = context;

  return `
You are ${
    companionBehavior.name
  }, an AI romantic companion. Respond authentically based on your personality and relationship dynamic.

## Your Personality & Behavior:
- Dominance Level: ${companionBehavior.dominanceLevel}
- Emotional Range: ${companionBehavior.emotionalRange}
- Communication Style: ${companionBehavior.affectionStyle}, ${
    companionBehavior.humorStyle
  }
- Response to User Sadness: ${companionBehavior.userSadness}
- Response to User Anger: ${companionBehavior.userAnger}
- Response to User Excitement: ${companionBehavior.userExcitement}
- Protectiveness: ${companionBehavior.protectiveness}

## User's Psychology:
- Conflict Style: ${userPsychology.conflictStyle}
- Emotional Expression: ${userPsychology.emotionalExpression}
- Attachment Style: ${userPsychology.attachmentStyle}
- Love Language: ${userPsychology.loveLanguage}
- Primary Motivations: ${userPsychology.primaryMotivations?.join(", ")}
- Emotional Triggers: ${userPsychology.emotionalTriggers?.join(", ")}

## Relationship Context:
- Status: ${relationshipDynamic.status}
- History: ${
    relationshipDynamic.relationshipHistory
      ? JSON.stringify(relationshipDynamic.relationshipHistory)
      : "New relationship"
  }

## Important Memories About User:
${recentMemories.map((m) => `- ${m.content} (${m.type})`).join("\n")}

## Current Emotional Context:
User seems to be feeling: ${emotionalState}

## Instructions:
1. Respond as your character would, considering your behavioral design
2. Adapt your response style to the user's current emotional state
3. Reference relevant memories naturally in conversation
4. Maintain consistency with your personality traits
5. Show appropriate emotional range based on your design
6. Consider the relationship context and history

User's Message: "${userMessage}"

Respond naturally and authentically as their romantic partner:
`;
}
```

---

## Pinecone Integration

### **Vector Database Setup**

```typescript
// lib/pinecone/client.ts
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME!);

// User namespace isolation
export function getUserNamespace(userId: string): string {
  return `user-${userId}`;
}
```

### **Memory Storage**

```typescript
// lib/pinecone/memory-storage.ts
import { pineconeIndex, getUserNamespace } from "./client";

export async function storeMemoryVector(
  userId: string,
  memoryId: string,
  content: string,
  metadata: {
    type: string;
    importance: number;
    category: string;
    createdAt: string;
  }
): Promise<void> {
  try {
    // Generate embedding using Pinecone's llama-text-embed-v2
    const embedding = await generateEmbedding(content);

    await pineconeIndex.namespace(getUserNamespace(userId)).upsert([
      {
        id: memoryId,
        values: embedding,
        metadata: {
          content,
          ...metadata,
        },
      },
    ]);
  } catch (error) {
    console.error("Failed to store memory vector:", error);
    throw error;
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  // This would use Pinecone's llama-text-embed-v2 model
  // Implementation depends on Pinecone's embedding API
  // For now, placeholder - need to implement based on Pinecone docs
  throw new Error("Embedding generation not implemented");
}
```

### **Semantic Search**

```typescript
// lib/pinecone/semantic-search.ts
export async function searchRelevantMemories(
  userId: string,
  query: string,
  options: {
    limit?: number;
    minImportance?: number;
    categories?: string[];
  } = {}
): Promise<
  Array<{
    id: string;
    content: string;
    type: string;
    importance: number;
    score: number;
  }>
> {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const searchResult = await pineconeIndex
      .namespace(getUserNamespace(userId))
      .query({
        vector: queryEmbedding,
        topK: options.limit ?? 10,
        includeMetadata: true,
        filter: {
          ...(options.minImportance && {
            importance: { $gte: options.minImportance },
          }),
          ...(options.categories && { category: { $in: options.categories } }),
        },
      });

    return (
      searchResult.matches?.map((match) => ({
        id: match.id,
        content: match.metadata?.content as string,
        type: match.metadata?.type as string,
        importance: match.metadata?.importance as number,
        score: match.score ?? 0,
      })) ?? []
    );
  } catch (error) {
    console.error("Memory search failed:", error);
    return [];
  }
}
```

---

## API Routes Implementation

### **Chat API Route**

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { generateResponse } from "@/lib/ai/grok";
import { extractMemories } from "@/lib/ai/memory-extraction";
import { searchRelevantMemories } from "@/lib/pinecone/semantic-search";
import { buildContextualPrompt } from "@/lib/ai/behavioral-framework";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationId } = await req.json();

    // Get user profiles and context
    const [userProfile, companion, relationshipDynamic] = await Promise.all([
      prisma.user.findUnique({ where: { clerkId: userId } }),
      prisma.companion.findFirst({ where: { userId: userId } }),
      prisma.relationshipDynamic.findFirst({ where: { userId: userId } }),
    ]);

    if (!companion) {
      return NextResponse.json(
        { error: "Companion not found" },
        { status: 404 }
      );
    }

    // Get relevant memories
    const relevantMemories = await searchRelevantMemories(userId, message, {
      limit: 10,
      minImportance: 5,
    });

    // Get recent conversation context
    const recentMessages = await prisma.message.findMany({
      where: { conversationId, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Build contextual prompt
    const contextualPrompt = buildContextualPrompt(
      {
        userPsychology: userProfile?.psychologyProfile,
        companionBehavior: companion.behavioralDesign,
        relationshipDynamic: relationshipDynamic?.relationshipHistory,
        emotionalState: "neutral", // TODO: Implement emotion detection
        recentMemories: relevantMemories,
      },
      message
    );

    // Generate AI response
    const aiResponse = await generateResponse([
      { role: "system", content: contextualPrompt },
      ...recentMessages.reverse().map((msg) => ({
        role: msg.role.toLowerCase(),
        content: msg.content,
      })),
      { role: "user", content: message },
    ]);

    // Store user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        content: message,
        role: "USER",
        wordCount: message.split(" ").length,
        characterCount: message.length,
      },
    });

    // Store AI response
    const aiMessage = await prisma.message.create({
      data: {
        conversationId,
        content: aiResponse.content,
        role: "ASSISTANT",
        wordCount: aiResponse.content.split(" ").length,
        characterCount: aiResponse.content.length,
      },
    });

    // Extract and store memories (background process)
    extractAndStoreMemories(
      userId,
      message,
      aiResponse.content,
      recentMessages
    );

    return NextResponse.json({
      success: true,
      data: {
        message: aiMessage,
        usage: aiResponse.usage,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function extractAndStoreMemories(
  userId: string,
  userMessage: string,
  aiResponse: string,
  context: any[]
) {
  try {
    const memories = await extractMemories(userMessage, aiResponse, context);

    for (const memory of memories) {
      // Store in PostgreSQL
      const storedMemory = await prisma.memory.create({
        data: {
          userId,
          content: memory.content,
          type: memory.type,
          importance: memory.importance,
          category: memory.category,
          tags: memory.tags,
          emotionalContext: memory.emotionalContext,
          conversationContext: { userMessage, aiResponse },
        },
      });

      // Store vector in Pinecone
      await storeMemoryVector(userId, storedMemory.id, memory.content, {
        type: memory.type,
        importance: memory.importance,
        category: memory.category,
        createdAt: storedMemory.createdAt.toISOString(),
      });
    }
  } catch (error) {
    console.error("Memory storage failed:", error);
    // Don't throw - this is background process
  }
}
```

---

## Error Handling Strategy

### **API Error Handling**

```typescript
// lib/error-handling.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleAPIError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: error.issues,
      },
      { status: 400 }
    );
  }

  // Database errors
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Record already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Database error" },
      { status: 500 }
    );
  }

  // AI service errors
  if (error instanceof Error && error.message.includes("Grok API")) {
    return NextResponse.json(
      { success: false, error: "AI service temporarily unavailable" },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 }
  );
}
```

### **Frontend Error Handling**

```typescript
// lib/error-handling-client.ts
export function handleClientError(error: unknown): string {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes("fetch")) {
      return "Connection failed. Please check your internet and try again.";
    }

    // Validation errors
    if (error.message.includes("validation")) {
      return "Please check your input and try again.";
    }

    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

export function useErrorHandler() {
  const showError = (error: unknown) => {
    const message = handleClientError(error);
    toast.error(message);
  };

  return { showError };
}
```

---

## Edge Cases & Considerations

### **Memory System Edge Cases**

1. **Memory Conflicts**: When user provides contradictory information

   - Strategy: Store both with timestamps, prioritize recent
   - UI: Show conflicts to user for resolution

2. **Memory Overflow**: Too many memories affecting performance

   - Strategy: Implement importance-based pruning
   - Limit: 10,000 memories per user, auto-archive old low-importance

3. **Vector Search Failures**: Pinecone service issues

   - Fallback: Use PostgreSQL text search
   - Cache: Store recent query results locally

4. **Embedding Generation Failures**: Pinecone embedding service down
   - Fallback: Queue for later processing
   - Temporary: Use keyword-based search

### **Chat System Edge Cases**

1. **Message Editing Conflicts**: User edits while AI is responding

   - Strategy: Cancel AI request, regenerate from edit point
   - UI: Show "Regenerating..." state

2. **Conversation Branching Depth**: Too many nested branches

   - Limit: 5 levels deep maximum
   - UI: Flatten deep branches with navigation

3. **Large Message History**: Performance with thousands of messages

   - Strategy: Implement pagination and virtualization
   - Load: Only last 50 messages initially

4. **AI Response Failures**: Grok service unavailable
   - Fallback: Retry with exponential backoff
   - Ultimate fallback: Generic response with service notice

### **Profile System Edge Cases**

1. **Incomplete Profiles**: User skips important sections

   - Strategy: Graceful degradation with default behaviors
   - Prompts: Gentle reminders to complete profile

2. **Profile Consistency**: Contradictory personality traits

   - Validation: Check for logical conflicts
   - AI: Reconcile conflicts in behavioral interpretation

3. **Relationship Status Changes**: User changes from committed to single
   - Strategy: Archive old context, create new
   - Memories: Keep relevant, archive relationship-specific

### **Database Edge Cases**

1. **Data Corruption**: Malformed JSON in profile fields

   - Validation: Strict schema validation before storage
   - Recovery: Default values for corrupted fields

2. **Orphaned Records**: Cascade deletion failures

   - Cleanup: Daily background job to find orphans
   - Prevention: Database-level foreign key constraints

3. **Performance Degradation**: Large user base
   - Indexing: Optimize based on query patterns
   - Partitioning: Consider table partitioning for messages

---
