import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

// GET endpoint to load user memories
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user's memories
    const memories = await db.memory.findMany({
      where: {
        userId: user.id,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      take: 500, // Limit to last 500 memories
    });

    // Format memories for frontend
    const formattedMemories = memories.map((memory) => ({
      id: memory.id,
      content: memory.content,
      type: memory.type,
      importance: memory.importance,
      category: memory.category,
      tags: memory.tags || [],
      createdAt: memory.createdAt.toISOString(),
      emotionalContext: memory.emotionalContext,
    }));

    return new Response(JSON.stringify({ memories: formattedMemories }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error loading memories:", error);
    return new Response(JSON.stringify({ error: "Failed to load memories" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// DELETE endpoint to delete a specific memory
export async function DELETE(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get memoryId from URL search params
    const url = new URL(req.url);
    const memoryId = url.searchParams.get("memoryId");

    if (!memoryId) {
      return new Response(JSON.stringify({ error: "Memory ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user to verify ownership
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find and verify memory ownership
    const memory = await db.memory.findUnique({
      where: { id: memoryId },
    });

    if (!memory) {
      return new Response(JSON.stringify({ error: "Memory not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (memory.userId !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Soft delete the memory
    await db.memory.update({
      where: { id: memoryId },
      data: { isDeleted: true },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting memory:", error);
    return new Response(JSON.stringify({ error: "Failed to delete memory" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
