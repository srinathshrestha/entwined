import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { grokProvider } from "@/lib/ai/grok";
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
  try {
    console.log("AI agent extracting and storing memories...");

    // Use AI to determine if this conversation contains memory-worthy content
    const memoryExtractionPrompt = `
Analyze this conversation and extract any important memories that should be stored.

User Message: "${userMessage}"
AI Response: "${aiResponse}"
Emotional Context: ${emotionalState}

Determine if this conversation contains any of the following memory-worthy content:
1. Personal preferences or dislikes
2. Important life events or experiences  
3. Emotional states or patterns
4. Relationship dynamics or changes
5. Goals, fears, or aspirations
6. Hobbies, interests, or passions
7. Family or social information
8. Work or career details

If memory-worthy content is found, extract 1-3 specific memories in this JSON format:
{
  "memories": [
    {
      "content": "Brief, specific memory content",
      "tags": ["relevant", "tags"],
      "importance": 1-10,
      "emotionalContext": "emotional state when formed"
    }
  ]
}

If no significant memory content is found, return: {"memories": []}
`;

    // Call AI to extract memories
    const memoryResult = await grokProvider("grok-3-mini").doGenerate({
      inputFormat: "messages",
      messages: [
        { role: "system", content: memoryExtractionPrompt },
        { role: "user", content: "Analyze the conversation for memories." },
      ],
      temperature: 0.3,
      maxTokens: 500,
    });

    let extractedMemories: Array<{
      content: string;
      tags: string[];
      importance: number;
      emotionalContext?: string;
    }> = [];

    try {
      const parsed = JSON.parse(memoryResult.text);
      extractedMemories = parsed.memories || [];
    } catch (parseError) {
      console.warn("Failed to parse memory extraction result:", parseError);
      return;
    }

    if (extractedMemories.length === 0) {
      console.log("No memories extracted from conversation");
      return;
    }

    console.log(`AI agent extracted ${extractedMemories.length} memories`);

    // Store each extracted memory
    const memoryPromises = extractedMemories.map(async (memory) => {
      try {
        await db.simplifiedMemory.create({
          data: {
            userId,
            companionId,
            content: memory.content,
            tags: memory.tags,
            importance: Math.min(Math.max(memory.importance, 1), 10), // Clamp 1-10
            emotionalContext: memory.emotionalContext || emotionalState,
            userCreated: false, // AI-generated memory
          },
        });
        return { success: true };
      } catch (error) {
        console.error("Failed to store AI memory:", error);
        return { success: false, error };
      }
    });

    const results = await Promise.allSettled(memoryPromises);
    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;

    console.log(
      `AI agent successfully stored ${successful}/${extractedMemories.length} memories`
    );
  } catch (error) {
    console.error("AI memory extraction failed:", error);
    // Non-critical - chat continues to work
  }
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
