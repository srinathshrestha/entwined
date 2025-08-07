import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Relationship history validation schemas
const relationshipHistorySchema = z.object({
  howMet: z.string().min(1, "How you met is required"),
  firstImpression: z.string().min(1, "First impression is required"),
  relationshipProgression: z
    .string()
    .min(1, "Relationship progression is required"),
  bestMemory: z.string().min(1, "Best memory is required"),
  funniest_moment: z.string().min(1, "Funny moment is required"),
  first_kiss_story: z.string().min(1, "First kiss story is required"),
  biggest_challenge_overcome: z
    .string()
    .min(1, "Biggest challenge is required"),
  living_situation: z.string().min(1, "Living situation is required"),
  daily_routine: z.string().min(1, "Daily routine is required"),
  special_traditions: z.string().min(1, "Special traditions is required"),
  future_plans: z.string().min(1, "Future plans is required"),
});

const earlyRelationshipSchema = z.object({
  howMet: z.string().min(1, "How you met is required"),
  initial_attraction: z.string().min(1, "Initial attraction is required"),
  current_stage: z.string().min(1, "Current stage is required"),
  hopes_for_future: z.string().min(1, "Hopes for future is required"),
});

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { relationshipStatus, ...relationshipData } = body;

    // Get existing user and relationship
    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        relationshipDynamic: true,
        companions: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please complete basic details first." },
        { status: 404 }
      );
    }

    if (!user.relationshipDynamic) {
      return NextResponse.json(
        {
          error: "Relationship not found. Please complete basic details first.",
        },
        { status: 404 }
      );
    }

    // Validate data based on relationship status
    const isCommittedRelationship = [
      "COMMITTED",
      "LIVING_TOGETHER",
      "MARRIED",
    ].includes(relationshipStatus);
    let validatedData;

    if (isCommittedRelationship) {
      validatedData = relationshipHistorySchema.parse(relationshipData);
    } else {
      validatedData = earlyRelationshipSchema.parse(relationshipData);
    }

    // Update relationship dynamic with history
    await db.relationshipDynamic.update({
      where: { id: user.relationshipDynamic.id },
      data: {
        relationshipHistory: validatedData,
      },
    });

    // Update user progress
    await db.user.update({
      where: { id: user.id },
      data: {
        currentStep: "avatar",
        stepsCompleted: [...(user.stepsCompleted || []), "relationship"].filter(
          (step, index, arr) => arr.indexOf(step) === index
        ),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        relationshipHistory: validatedData,
      },
    });
  } catch (error) {
    console.error("Relationship onboarding error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data provided", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        relationshipDynamic: true,
        companions: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const companion = user.companions[0];
    const relationshipDynamic = user.relationshipDynamic;

    return NextResponse.json({
      success: true,
      data: {
        relationshipStatus: relationshipDynamic?.status,
        relationshipHistory: relationshipDynamic?.relationshipHistory,
        companionName: companion?.name || "your companion",
        currentStep: user.currentStep,
        stepsCompleted: user.stepsCompleted,
      },
    });
  } catch (error) {
    console.error("Get relationship data error:", error);
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

    const body = await req.json();
    const { relationshipStatus, ...relationshipData } = body;

    // Validate based on relationship status
    const isCommittedRelationship = [
      "COMMITTED",
      "LIVING_TOGETHER",
      "MARRIED",
    ].includes(relationshipStatus);
    const schema = isCommittedRelationship
      ? relationshipHistorySchema
      : earlyRelationshipSchema;
    const validatedData = schema.parse(relationshipData);

    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const relationshipDynamic = await db.relationshipDynamic.findFirst({
      where: { userId: user.id },
    });

    if (!relationshipDynamic) {
      return NextResponse.json(
        { error: "Relationship not found" },
        { status: 404 }
      );
    }

    const updatedRelationship = await db.relationshipDynamic.update({
      where: { id: relationshipDynamic.id },
      data: {
        status: relationshipStatus,
        relationshipHistory: validatedData,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        relationshipStatus: updatedRelationship.status,
        relationshipHistory: updatedRelationship.relationshipHistory,
      },
    });
  } catch (error) {
    console.error("Update relationship error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid data provided", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
