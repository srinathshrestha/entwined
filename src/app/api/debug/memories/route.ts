import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Debug endpoint to view recent memory creation activity
 * GET /api/debug/memories
 */
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        companions: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get recent memories for debugging
    const recentMemories = await db.simplifiedMemory.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        content: true,
        tags: true,
        importance: true,
        emotionalContext: true,
        userCreated: true,
        createdAt: true,
        isVisible: true,
      },
    });

    // Memory statistics
    const memoryStats = await db.simplifiedMemory.groupBy({
      by: ["userCreated"],
      where: {
        userId: user.id,
      },
      _count: {
        id: true,
      },
    });

    const totalMemories = await db.simplifiedMemory.count({
      where: { userId: user.id },
    });

    const userCreatedCount =
      memoryStats.find((stat) => stat.userCreated)?._count.id || 0;
    const aiCreatedCount =
      memoryStats.find((stat) => !stat.userCreated)?._count.id || 0;

    return NextResponse.json({
      success: true,
      debug: {
        totalMemories,
        userCreatedCount,
        aiCreatedCount,
        recentMemories: recentMemories.map((memory) => ({
          ...memory,
          createdAt: memory.createdAt.toISOString(),
          creator: memory.userCreated ? "User" : "AI Agent",
        })),
      },
      instructions: {
        message: "This endpoint helps debug memory creation",
        memoryConditions: [
          "Personal preferences or dislikes",
          "Important life events or experiences",
          "Emotional states or patterns",
          "Relationship dynamics or changes",
          "Goals, fears, or aspirations",
          "Hobbies, interests, or passions",
          "Family or social information",
          "Work or career details",
        ],
        howToTrigger:
          "Have meaningful conversations that include personal information",
        checkLogs: "Look at server console logs for memory extraction details",
      },
    });
  } catch (error) {
    console.error("Debug memories API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
