import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Schema for creating a new memory
const createMemorySchema = z.object({
  content: z.string().min(1, "Memory content is required"),
  tags: z.array(z.string()).default([]),
  importance: z.number().min(1).max(10).default(5),
  emotionalContext: z.string().optional(),
  userCreated: z.boolean().default(false),
});

// Schema for updating a memory
const updateMemorySchema = z.object({
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  importance: z.number().min(1).max(10).optional(),
  emotionalContext: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companionId = searchParams.get("companionId");
    const tags = searchParams.get("tags")?.split(",") || [];
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50");

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build where clause
    const where: any = {
      userId: user.id,
      isVisible: true,
    };

    if (companionId) {
      where.companionId = companionId;
    }

    if (tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    if (search) {
      where.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Fetch memories
    const memories = await db.simplifiedMemory.findMany({
      where,
      orderBy: [
        { importance: "desc" },
        { lastAccessed: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    return NextResponse.json({
      success: true,
      memories,
    });
  } catch (error) {
    console.error("Error fetching memories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createMemorySchema.parse(body);

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

    if (!user.companions.length) {
      return NextResponse.json(
        { error: "No companion found" },
        { status: 404 }
      );
    }

    const companion = user.companions[0];

    // Create memory
    const memory = await db.simplifiedMemory.create({
      data: {
        userId: user.id,
        companionId: companion.id,
        content: validatedData.content,
        tags: validatedData.tags,
        importance: validatedData.importance,
        emotionalContext: validatedData.emotionalContext,
        userCreated: validatedData.userCreated,
      },
    });

    return NextResponse.json({
      success: true,
      memory,
    });
  } catch (error) {
    console.error("Error creating memory:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memoryId = searchParams.get("id");

    if (!memoryId) {
      return NextResponse.json(
        { error: "Memory ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = updateMemorySchema.parse(body);

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update memory (only if user owns it)
    const memory = await db.simplifiedMemory.updateMany({
      where: {
        id: memoryId,
        userId: user.id,
      },
      data: validatedData,
    });

    if (memory.count === 0) {
      return NextResponse.json(
        { error: "Memory not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Memory updated successfully",
    });
  } catch (error) {
    console.error("Error updating memory:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memoryId = searchParams.get("id");

    if (!memoryId) {
      return NextResponse.json(
        { error: "Memory ID is required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete memory (only if user owns it)
    const memory = await db.simplifiedMemory.deleteMany({
      where: {
        id: memoryId,
        userId: user.id,
      },
    });

    if (memory.count === 0) {
      return NextResponse.json(
        { error: "Memory not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Memory deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting memory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}