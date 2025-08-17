import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { grokProvider, generateResponse } from "@/lib/ai/grok";
import {
  buildSimplifiedPrompt,
  determineEmotionalState,
} from "@/lib/ai/simplified-behavioral-framework";
import { db } from "@/lib/db";
import { SimplifiedMemory, SimplifiedPersonality } from "@/types";
import { streamText } from "ai";

// Schema for incoming message with tagged memories
interface SimplifiedChatRequest {
  message: string;
  selectedMemories?: SimplifiedMemory[];
  conversationId?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as SimplifiedChatRequest;
    const { message, selectedMemories = [], conversationId } = body;

    // Validate input message
    if (
      !message ||
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return new Response(
        JSON.stringify({ error: "Message is required and cannot be empty" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Clean and validate message length
    const cleanMessage = message.trim();
    if (cleanMessage.length > 4000) {
      return new Response(
        JSON.stringify({
          error: "Message too long. Please keep it under 4000 characters.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user and companion
    const user = await db.user.findUnique({
      where: { clerkId },
      include: { companions: true },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!user.companions.length) {
      return new Response(
        JSON.stringify({
          error: "Companion not found. Please complete onboarding.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const companion = user.companions[0];

    // Build simplified personality from companion data
    const personality: SimplifiedPersonality = {
      affectionLevel: companion.affectionLevel,
      empathyLevel: companion.empathyLevel,
      curiosityLevel: companion.curiosityLevel,
      playfulness: companion.playfulness,
      humorStyle: companion.humorStyle as
        | "playful"
        | "witty"
        | "gentle"
        | "sarcastic"
        | "serious",
      communicationStyle: companion.communicationStyle as
        | "casual"
        | "formal"
        | "intimate"
        | "professional",
      userPreferredAddress: companion.userPreferredAddress,
      partnerPronouns: companion.partnerPronouns as
        | "he/him"
        | "she/her"
        | "they/them"
        | "other",
    };

    // Ensure conversation exists
    let conversation = await db.conversation.findFirst({
      where: {
        userId: user.id,
        companionId: companion.id,
        ...(conversationId && { id: conversationId }),
      },
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          userId: user.id,
          companionId: companion.id,
          title: `Chat with ${companion.name}`,
        },
      });
    }

    // Get recent conversation context
    const recentMessages = await db.message.findMany({
      where: { conversationId: conversation.id, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Update last accessed for selected memories
    if (selectedMemories.length > 0) {
      await db.simplifiedMemory.updateMany({
        where: {
          id: { in: selectedMemories.map((m) => m.id) },
          userId: user.id,
        },
        data: {
          lastAccessed: new Date(),
        },
      });
    }

    // Determine emotional state
    const emotionalState = determineEmotionalState(cleanMessage);

    // Build contextual prompt using simplified framework
    const contextualPrompt = buildSimplifiedPrompt(
      {
        personality,
        memories: selectedMemories,
        emotionalState,
        companionName: companion.name,
        recentMessages: recentMessages.reverse().map((msg) => ({
          role: msg.role.toLowerCase(),
          content: msg.content,
        })),
      },
      cleanMessage
    );

    // Prepare conversation history for AI
    const conversationMessages = [
      { role: "system" as const, content: contextualPrompt },
      ...recentMessages.map((msg) => ({
        role: msg.role.toLowerCase() as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: cleanMessage },
    ];

    // Store user message
    await db.message.create({
      data: {
        conversationId: conversation.id,
        content: cleanMessage,
        role: "USER",
        wordCount: cleanMessage.split(" ").length,
        characterCount: cleanMessage.length,
      },
    });

    // Generate streaming AI response
    const result = streamText({
      model: grokProvider("grok-3-mini"),
      messages: conversationMessages,
      temperature: 0.8,
      maxTokens: 1000,
      onFinish: async (result) => {
        // Store AI response in database
        await db.message.create({
          data: {
            conversationId: conversation.id,
            content: result.text,
            role: "ASSISTANT",
            wordCount: result.text.split(" ").length,
            characterCount: result.text.length,
          },
        });

        // Let AI agent write memories to database (background process)
        extractAndStoreSimplifiedMemories(
          user.id,
          companion.id,
          cleanMessage,
          result.text,
          emotionalState,
          selectedMemories
        );
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Simplified Chat API error:", error);

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    // Clean up large objects to prevent memory leaks in Next.js server
    // This is especially important for streaming responses with large conversation histories
    if (typeof conversationMessages !== "undefined") {
      conversationMessages.length = 0;
    }
    if (typeof recentMessages !== "undefined") {
      recentMessages.length = 0;
    }
    if (typeof selectedMemories !== "undefined") {
      selectedMemories.length = 0;
    }
  }
}

/**
 * Background process for AI agent to write memories to database
 * This function allows the AI to autonomously create and store memories
 */
async function extractAndStoreSimplifiedMemories(
  userId: string,
  companionId: string,
  userMessage: string,
  aiResponse: string,
  emotionalState: string,
  contextMemories: SimplifiedMemory[]
): Promise<void> {
  // Initialize extractedMemories at function scope to avoid reference errors
  let extractedMemories: Array<{
    content: string;
    tags: string[];
    importance: number;
    emotionalContext?: string;
  }> = [];

  try {
    console.log("🧠 AI agent analyzing conversation for memories...");
    console.log(`📝 User message: "${userMessage.substring(0, 100)}..."`);
    console.log(`🤖 AI response: "${aiResponse.substring(0, 100)}..."`);
    console.log(`😊 Emotional state: ${emotionalState}`);

    // Use AI to determine if this conversation contains memory-worthy content
    const memoryExtractionPrompt = `
You are a memory extraction AI. Analyze this conversation and extract ONLY genuinely important memories.

CONVERSATION:
User: "${userMessage}"
Assistant: "${aiResponse}"
Emotional Context: ${emotionalState}

MEMORY CRITERIA - Extract memories ONLY if they contain:
1. 🎯 Personal preferences/dislikes (food, activities, places, etc.)
2. 📅 Significant life events/experiences (past/future plans)
3. 😊 Strong emotional moments/patterns (fears, joys, concerns)
4. 💕 Relationship information (family, friends, romantic)
5. 🎯 Goals, aspirations, or fears
6. 🎨 Hobbies, interests, or passions
7. 👨‍👩‍👧‍👦 Family/social details (names, relationships)
8. 💼 Work/career information (job, studies, projects)

QUALITY RULES:
- Create 1-3 memories maximum per conversation
- Be specific and factual, not vague
- Focus on NEW information about the user
- Avoid generic responses or small talk
- Each memory should be a complete, standalone fact

IMPORTANCE SCALE:
- 1-3: Minor preferences (likes coffee)
- 4-6: Moderate facts (works as teacher)
- 7-8: Important personal info (family member names)
- 9-10: Life-changing events (moving, marriage, death)

OUTPUT FORMAT (strict JSON only):
{
  "memories": [
    {
      "content": "Specific factual memory (20-50 words)",
      "tags": ["2-4", "relevant", "keywords"],
      "importance": 1-10,
      "emotionalContext": "emotional state"
    }
  ]
}

If NO significant memory content is found, return: {"memories": []}
`;

    // Multi-layered memory extraction approach
    let memoryResult;

    try {
      // Primary: Try AI-based extraction
      console.log("🤖 Attempting AI-based memory extraction...");
      memoryResult = await generateResponse(
        [
          { role: "system", content: memoryExtractionPrompt },
          { role: "user", content: "Analyze the conversation for memories." },
        ],
        {
          temperature: 0.3,
          maxTokens: 500,
        }
      );

      // Check if we got a valid response
      if (
        !memoryResult?.content ||
        memoryResult.content.trim().length === 0 ||
        memoryResult.content.includes("technical difficulties") ||
        memoryResult.content.includes("experiencing some technical")
      ) {
        console.warn("⚠️ AI returned empty/invalid response, using fallback");
        throw new Error(
          "AI service unavailable, using pattern-based extraction"
        );
      }

      console.log("✅ AI extraction successful");
    } catch (aiError) {
      console.warn(
        "⚠️ AI extraction failed, using pattern-based fallback:",
        aiError.message
      );

      // Fallback: Use pattern-based extraction immediately
      const patternMemories = extractMemoriesFromText("", userMessage);
      if (patternMemories.length > 0) {
        console.log(
          `🔧 Pattern-based extraction found ${patternMemories.length} memories`
        );
        extractedMemories = patternMemories;

        // Skip the JSON parsing section and go directly to storage
        if (extractedMemories.length > 0) {
          await storeExtractedMemories(
            extractedMemories,
            userId,
            companionId,
            emotionalState
          );
        }

        // Clean up references to prevent memory leaks
        extractedMemories = [];
        return;
      } else {
        console.log("❌ No memories found with pattern extraction either");
        return;
      }
    }

    // extractedMemories is now declared at function scope above

    try {
      console.log(`🔍 Raw AI memory response: ${memoryResult.content}`);

      // Try to clean up the response in case there's extra text
      let cleanResponse = memoryResult.content.trim();

      // Find JSON block if it's wrapped in markdown or other text
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanResponse);
      extractedMemories = parsed.memories || [];
      console.log(`📊 Parsed ${extractedMemories.length} potential memories`);

      // Validate each memory has required fields
      extractedMemories = extractedMemories.filter((memory) => {
        if (
          !memory.content ||
          !memory.tags ||
          typeof memory.importance !== "number"
        ) {
          console.warn(`⚠️ Skipping invalid memory: ${JSON.stringify(memory)}`);
          return false;
        }
        return true;
      });

      console.log(`✅ Validated ${extractedMemories.length} valid memories`);
    } catch (parseError) {
      console.warn("❌ Failed to parse memory extraction result:", parseError);
      console.warn("📄 Raw response was:", memoryResult.content);

      // Try to extract memories manually if JSON parsing fails
      try {
        const fallbackMemories = extractMemoriesFromText(
          memoryResult.content,
          userMessage
        );
        if (fallbackMemories.length > 0) {
          console.log(
            `🔧 Fallback extraction found ${fallbackMemories.length} memories`
          );
          extractedMemories = fallbackMemories;
        } else {
          return;
        }
      } catch (fallbackError) {
        console.warn(
          "❌ Fallback memory extraction also failed:",
          fallbackError
        );
        return;
      }
    }

    if (extractedMemories.length === 0) {
      console.log("No memories extracted from conversation");
      return;
    }

    console.log(`🎯 AI agent extracted ${extractedMemories.length} memories`);

    // Use centralized storage function with enhanced validation
    if (extractedMemories.length > 0) {
      await storeExtractedMemories(
        extractedMemories,
        userId,
        companionId,
        emotionalState
      );
    }

    // Clean up references to prevent memory leaks
    extractedMemories = [];
  } catch (error) {
    console.error("❌ AI memory extraction failed:", error);
    // Clean up references even on error
    extractedMemories = [];
    // Non-critical - chat continues to work
  } finally {
    // Ensure cleanup happens regardless of success/failure
    extractedMemories = [];
  }
}

/**
 * Store extracted memories with deduplication and validation
 * Based on AI agent memory management best practices
 */
async function storeExtractedMemories(
  memories: Array<{
    content: string;
    tags: string[];
    importance: number;
    emotionalContext?: string;
  }>,
  userId: string,
  companionId: string,
  emotionalState: string
): Promise<void> {
  try {
    console.log(`💾 Storing ${memories.length} memories...`);

    // Check for duplicates against existing memories (limit query size to prevent memory issues)
    const existingMemories = await db.simplifiedMemory.findMany({
      where: { userId, companionId },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to prevent memory bloat
      select: {
        content: true, // Only select content field to reduce memory usage
        id: true,
      },
    });

    // Filter out duplicates
    const uniqueMemories = memories.filter((newMemory) => {
      const isDuplicate = existingMemories.some((existing) => {
        const similarity = calculateSimilarity(
          newMemory.content,
          existing.content
        );
        return similarity > 0.8;
      });
      return !isDuplicate;
    });

    if (uniqueMemories.length < memories.length) {
      console.log(
        `🔍 Filtered out ${
          memories.length - uniqueMemories.length
        } duplicate memories`
      );
    }

    if (uniqueMemories.length === 0) {
      console.log("⏭️ No new unique memories to store");
      return;
    }

    // Store each unique memory with validation
    const memoryPromises = uniqueMemories.map(async (memory) => {
      try {
        // Validate memory content for security (prevent injection)
        if (!isValidMemoryContent(memory.content)) {
          console.warn(
            `🚫 Rejected potentially malicious memory: ${memory.content}`
          );
          return { success: false, reason: "security_validation_failed" };
        }

        await db.simplifiedMemory.create({
          data: {
            userId,
            companionId,
            content: memory.content,
            tags: memory.tags,
            importance: Math.min(Math.max(memory.importance, 1), 10),
            emotionalContext: memory.emotionalContext || emotionalState,
            userCreated: false,
          },
        });
        return { success: true };
      } catch (error) {
        console.error("Failed to store memory:", error);
        return { success: false, error };
      }
    });

    const results = await Promise.allSettled(memoryPromises);
    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;

    console.log(
      `✅ Successfully stored ${successful}/${uniqueMemories.length} memories`
    );

    // Log stored memories for debugging
    if (successful > 0) {
      console.log("📋 Stored memories:");
      uniqueMemories.slice(0, successful).forEach((memory, index) => {
        console.log(
          `  ${index + 1}. "${memory.content}" (importance: ${
            memory.importance
          }, tags: [${memory.tags.join(", ")}])`
        );
      });
    }
  } catch (error) {
    console.error("❌ Memory storage failed:", error);
  } finally {
    // Clean up local variables to prevent memory leaks
    // This is important in Next.js server-side functions
    memories.length = 0;
  }
}

/**
 * Validate memory content for security (prevent memory injection attacks)
 * Based on AI agent security best practices
 */
function isValidMemoryContent(content: string): boolean {
  // Basic security checks
  const suspiciousPatterns = [
    /system prompt/gi,
    /ignore previous/gi,
    /forget everything/gi,
    /override/gi,
    /<script/gi,
    /javascript:/gi,
    /data:text\/html/gi,
  ];

  return !suspiciousPatterns.some((pattern) => pattern.test(content));
}

/**
 * Fallback memory extraction when JSON parsing fails
 * Looks for obvious memory patterns in user message
 */
function extractMemoriesFromText(
  aiResponse: string,
  userMessage: string
): Array<{
  content: string;
  tags: string[];
  importance: number;
  emotionalContext?: string;
}> {
  const memories: Array<{
    content: string;
    tags: string[];
    importance: number;
    emotionalContext?: string;
  }> = [];

  // Enhanced pattern matching for comprehensive memory extraction
  const patterns = [
    // Food preferences (specific for chocolate, pastries, desserts)
    {
      regex:
        /I (love|like|enjoy|adore|crave) (chocolate|pastry|pastries|dessert|desserts|cake|cakes|cookies|sweets?)([^.!?]*)/gi,
      importance: 6,
      tags: ["food", "preferences", "desserts"],
    },
    // General preferences with intensity
    {
      regex:
        /I (really |absolutely |totally )?(love|like|enjoy|prefer|adore) ([^,.!?]+)/gi,
      importance: 5,
      tags: ["preferences"],
    },
    // Food consumption patterns
    {
      regex:
        /I (can eat|could eat|eat) (a lot of|lots of|many|tons of|millions of|a million) ([^,.!?]+)/gi,
      importance: 5,
      tags: ["food", "habits", "preferences"],
    },
    // Career and work
    {
      regex: /I (work as|am a|am an) ([^,.!?]+)/gi,
      importance: 6,
      tags: ["career", "work"],
    },
    // Family relationships
    {
      regex:
        /My (family|mom|dad|mother|father|sister|brother|wife|husband|partner) ([^,.!?]+)/gi,
      importance: 7,
      tags: ["family"],
    },
    // Possessions and ownership
    {
      regex: /I have ([^,.!?]+)/gi,
      importance: 5,
      tags: ["personal"],
    },
    // Goals and aspirations
    {
      regex: /I (want to|plan to|hope to|dream of|intend to) ([^,.!?]+)/gi,
      importance: 6,
      tags: ["goals", "aspirations"],
    },
    // Hobbies and activities
    {
      regex: /I (play|do|practice|enjoy) ([^,.!?]+)/gi,
      importance: 5,
      tags: ["hobbies", "activities"],
    },
    // Emotional expressions
    {
      regex:
        /I (feel|am|get) (happy|sad|excited|nervous|anxious|proud|scared) (about|when|because) ([^,.!?]+)/gi,
      importance: 6,
      tags: ["emotions", "feelings"],
    },
  ];

  for (const pattern of patterns) {
    const matches = userMessage.matchAll(pattern.regex);
    for (const match of matches) {
      let contentPart = "";
      let fullContent = "";

      // Handle different match patterns
      if (match.length >= 4 && match[3]) {
        // For patterns with 3+ capture groups (like food preferences)
        contentPart = `${match[2]} ${match[3]}`.trim();
        fullContent = `User ${match[1]} ${contentPart}`;
      } else if (match.length >= 3 && match[2]) {
        // For patterns with 2 capture groups
        contentPart = match[2].trim();
        fullContent = `User ${match[1]} ${contentPart}`;
      }

      // Only add if content is meaningful
      if (contentPart && contentPart.length > 3) {
        memories.push({
          content: fullContent,
          tags: pattern.tags,
          importance: pattern.importance,
          emotionalContext: "positive",
        });

        console.log(
          `🎯 Pattern match: "${fullContent}" (tags: [${pattern.tags.join(
            ", "
          )}])`
        );
      }
    }
  }

  // Remove duplicates and return top memories
  const uniqueMemories = memories.filter(
    (memory, index, self) =>
      index === self.findIndex((m) => m.content === memory.content)
  );

  return uniqueMemories.slice(0, 3); // Max 3 fallback memories
}

/**
 * Calculate text similarity using simple word overlap
 * Returns value between 0 (no similarity) and 1 (identical)
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

// GET endpoint to load conversation history
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user and their conversation
    const user = await db.user.findUnique({
      where: { clerkId },
      include: { companions: true },
    });

    if (!user || !user.companions.length) {
      return new Response(JSON.stringify({ messages: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const companion = user.companions[0];

    // Get conversation
    const conversation = await db.conversation.findFirst({
      where: { userId: user.id, companionId: companion.id },
    });

    if (!conversation) {
      return new Response(JSON.stringify({ messages: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get messages from the conversation
    const messages = await db.message.findMany({
      where: { conversationId: conversation.id, isDeleted: false },
      orderBy: { createdAt: "asc" },
      take: 50, // Last 50 messages
    });

    // Convert to chat format
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      role: msg.role.toLowerCase() === "user" ? "user" : "assistant",
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
    }));

    return new Response(
      JSON.stringify({
        messages: formattedMessages,
        companion: {
          name: companion.name,
          id: companion.id,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error loading conversation:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load conversation" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
