import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { grokProvider } from "@/lib/ai/grok";
import { extractMemories } from "@/lib/ai/memory-extraction";
import { searchRelevantMemories } from "@/lib/pinecone/semantic-search";
import {
  storeMemoryVector,
  checkPineconeHealth,
} from "@/lib/pinecone/memory-storage";
import {
  buildContextualPrompt,
  determineEmotionalState,
} from "@/lib/ai/behavioral-framework";
import { db } from "@/lib/db";
import { UserPsychology, PartnerDesign } from "@/types";
import { MemoryType } from "@prisma/client";
import { streamText } from "ai";

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
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const companion = await db.companion.findFirst({
      where: { userId: user.id },
    });
    if (!companion) {
      return new Response(JSON.stringify({ error: "Companion not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    // Convert to AI SDK format
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      role: msg.role.toLowerCase() === "user" ? "user" : "assistant",
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
    }));

    return new Response(JSON.stringify({ messages: formattedMessages }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error loading conversation:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load conversation" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
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

    const body = await req.json();

    // Handle both Vercel AI SDK format and custom format
    let message: string;
    let conversationId: string;

    if (body.messages && Array.isArray(body.messages)) {
      // Vercel AI SDK format: { messages: [{ role, content }] }
      const lastMessage = body.messages[body.messages.length - 1];
      if (!lastMessage || lastMessage.role !== "user") {
        return new Response(
          JSON.stringify({ error: "No user message found" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      message = lastMessage.content;
      // Use a default conversation ID for now - in production, implement proper conversation management
      conversationId = `user-${clerkId}-default`;
    } else {
      // Custom format: { message, conversationId }
      ({ message, conversationId } = body);
    }

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

    // Get user profiles and context with comprehensive error handling
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [companion, relationshipDynamic] = await Promise.all([
      db.companion.findFirst({ where: { userId: user.id } }),
      db.relationshipDynamic.findFirst({ where: { userId: user.id } }),
    ]);

    if (!companion) {
      return new Response(JSON.stringify({ error: "Companion not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Ensure conversation exists with robust handling
    let conversation = await db.conversation.findFirst({
      where: {
        userId: user.id,
        companionId: companion.id,
        id: conversationId.startsWith("user-") ? undefined : conversationId,
      },
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          id: conversationId.startsWith("user-") ? conversationId : undefined,
          userId: user.id,
          companionId: companion.id,
          title: "Chat with " + companion.name,
        },
      });
    }

    // Use the actual conversation ID
    conversationId = conversation.id;

    // Get relevant memories with robust error handling and fallbacks
    let relevantMemories: Array<{
      id: string;
      content: string;
      type: string;
      importance: number;
      score: number;
    }> = [];

    try {
      console.log("Searching for relevant memories...");
      relevantMemories = await searchRelevantMemories(user.id, cleanMessage, {
        limit: 8,
        minImportance: 4,
        minScore: 0.6,
      });
      console.log(`Found ${relevantMemories.length} relevant memories`);
    } catch (error) {
      console.warn("Memory search failed, continuing without memories:", error);
      // Continue without memories - this is not a critical failure
    }

    // Get recent conversation context
    const recentMessages = await db.message.findMany({
      where: { conversationId, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 15, // Reduced for better performance
    });

    // Determine emotional state with error handling
    let emotionalState = "neutral";
    try {
      emotionalState = determineEmotionalState(cleanMessage);
    } catch (error) {
      console.warn("Failed to determine emotional state:", error);
      // Use default neutral state
    }

    // Build contextual prompt with enhanced error handling
    let contextualPrompt: string;
    try {
      contextualPrompt = buildContextualPrompt(
        {
          userPsychology: user?.psychologyProfile as UserPsychology | null,
          companionBehavior: companion.behavioralDesign as PartnerDesign | null,
          relationshipDynamic:
            relationshipDynamic?.relationshipHistory as Record<
              string,
              unknown
            > | null,
          emotionalState,
          recentMemories: relevantMemories as Array<Record<string, unknown>>,
        },
        cleanMessage,
        companion.name
      );
    } catch (error) {
      console.error("Failed to build contextual prompt:", error);
      // Fallback to basic prompt
      contextualPrompt = `You are ${companion.name}, a supportive AI companion. Respond naturally to: "${cleanMessage}"`;
    }

    // Prepare conversation history for AI
    const conversationMessages = [
      { role: "system" as const, content: contextualPrompt },
      ...recentMessages.reverse().map((msg) => ({
        role: msg.role.toLowerCase() as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: cleanMessage },
    ];

    // Store user message first
    await db.message.create({
      data: {
        conversationId,
        content: cleanMessage,
        role: "USER",
        wordCount: cleanMessage.split(" ").length,
        characterCount: cleanMessage.length,
      },
    });

    // Convert messages to proper format for AI SDK
    const aiMessages = conversationMessages.map((msg) => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.content,
    }));

    // Generate streaming AI response
    const result = streamText({
      model: grokProvider("grok-3-mini"),
      messages: aiMessages,
      temperature: 0.8,
      maxTokens: 1000,
      onFinish: async (result) => {
        // Store AI response in database
        await db.message.create({
          data: {
            conversationId,
            content: result.text,
            role: "ASSISTANT",
            wordCount: result.text.split(" ").length,
            characterCount: result.text.length,
          },
        });

        // Extract and store memories (background process)
        extractAndStoreMemoriesBackground(
          user.id,
          cleanMessage,
          result.text,
          recentMessages.slice(-5)
        );
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);

    // Return appropriate error response
    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return new Response(
          JSON.stringify({
            error: "Service temporarily busy. Please try again in a moment.",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      if (error.message.includes("timeout")) {
        return new Response(
          JSON.stringify({ error: "Request timed out. Please try again." }),
          { status: 408, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Background process to extract and store memories
 * This function runs asynchronously and doesn't block the main chat response
 */
async function extractAndStoreMemoriesBackground(
  userId: string,
  userMessage: string,
  aiResponse: string,
  context: Array<{ content: string; role: string; createdAt: Date }>
): Promise<void> {
  try {
    console.log("Starting background memory extraction...");

    // Check if Pinecone is available (optional check)
    const pineconeHealth = await checkPineconeHealth();
    if (!pineconeHealth.available) {
      console.warn(
        "Pinecone unavailable, memories will be stored in PostgreSQL only:",
        pineconeHealth.error
      );
    }

    // Extract memories with improved error handling
    const memories = await extractMemories(
      userMessage,
      aiResponse,
      context.map((msg) => ({
        content: msg.content,
        role: msg.role,
        createdAt: msg.createdAt.toISOString(),
      }))
    );

    if (memories.length === 0) {
      console.log("No new memories extracted from conversation");
      return;
    }

    console.log(`Extracted ${memories.length} memories, storing...`);

    // Store each memory with robust error handling
    const memoryResults = await Promise.allSettled(
      memories.map(async (memory) => {
        try {
          // Store in PostgreSQL first (this is critical)
          const storedMemory = await db.memory.create({
            data: {
              userId,
              content: memory.content,
              type: memory.type as MemoryType, // Type assertion for MemoryType enum
              importance: memory.importance,
              category: memory.category,
              tags: memory.tags,
              emotionalContext: memory.emotionalContext,
              conversationContext: {
                userMessage: userMessage.slice(0, 200),
                aiResponse: aiResponse.slice(0, 200),
                timestamp: new Date().toISOString(),
              },
            },
          });

          // Store vector in Pinecone (optional - failures don't break the flow)
          if (pineconeHealth.available) {
            try {
              const vectorResult = await storeMemoryVector(
                userId,
                storedMemory.id,
                memory.content,
                {
                  type: memory.type,
                  importance: memory.importance,
                  category: memory.category,
                  createdAt: storedMemory.createdAt.toISOString(),
                }
              );

              if (!vectorResult.success) {
                console.warn(
                  `Failed to store vector for memory ${storedMemory.id}:`,
                  vectorResult.error
                );
              }
            } catch (vectorError) {
              console.warn(
                `Vector storage failed for memory ${storedMemory.id}:`,
                vectorError
              );
              // Continue - PostgreSQL storage is sufficient
            }
          }

          return { success: true, memoryId: storedMemory.id };
        } catch (error) {
          console.error("Failed to store memory:", error, memory);
          return { success: false, error };
        }
      })
    );

    // Log results
    const successful = memoryResults.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;

    const failed = memoryResults.length - successful;

    if (successful > 0) {
      console.log(`Successfully stored ${successful} memories`);
    }

    if (failed > 0) {
      console.warn(`Failed to store ${failed} memories`);
    }
  } catch (error) {
    console.error("Background memory extraction failed:", error);
    // This is non-critical - the chat functionality continues to work
  }
}
