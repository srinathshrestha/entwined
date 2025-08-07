import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const basicDetailsSchema = z.object({
  user: z.object({
    name: z.string().min(1, "Name is required"),
    age: z.number().min(18, "Must be at least 18").max(99, "Must be under 100"),
    location: z.string().min(1, "Location is required"),
    occupation: z.string().min(1, "Occupation is required"),
  }),
  companion: z.object({
    name: z.string().min(1, "Companion name is required"),
    gender: z.enum(["male", "female", "non-binary"]),
    age: z.number().min(18, "Must be at least 18").max(99, "Must be under 100"),
    location: z.string().min(1, "Location is required"),
    occupation: z.string().min(1, "Occupation is required"),
  }),
  relationshipStatus: z.enum([
    "JUST_MET",
    "EARLY_DATING",
    "COMMITTED",
    "LIVING_TOGETHER",
    "MARRIED",
  ]),
});

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = basicDetailsSchema.parse(body);

    // Update or create user
    const user = await db.user.upsert({
      where: { clerkId },
      update: {
        name: validatedData.user.name,
        age: validatedData.user.age,
        location: validatedData.user.location,
        occupation: validatedData.user.occupation,
        currentStep: "psychology",
        stepsCompleted: ["basic"],
      },
      create: {
        clerkId,
        name: validatedData.user.name,
        age: validatedData.user.age,
        location: validatedData.user.location,
        occupation: validatedData.user.occupation,
        currentStep: "psychology",
        stepsCompleted: ["basic"],
      },
    });

    // Create or update companion
    let companion = await db.companion.findFirst({
      where: { userId: user.id },
    });

    if (companion) {
      companion = await db.companion.update({
        where: { id: companion.id },
        data: {
          name: validatedData.companion.name,
          gender: validatedData.companion.gender,
          age: validatedData.companion.age,
          location: validatedData.companion.location,
          occupation: validatedData.companion.occupation,
        },
      });
    } else {
      companion = await db.companion.create({
        data: {
          userId: user.id,
          name: validatedData.companion.name,
          gender: validatedData.companion.gender,
          age: validatedData.companion.age,
          location: validatedData.companion.location,
          occupation: validatedData.companion.occupation,
        },
      });
    }

    // Create or update relationship dynamic
    let relationshipDynamic = await db.relationshipDynamic.findFirst({
      where: { userId: user.id },
    });

    if (relationshipDynamic) {
      relationshipDynamic = await db.relationshipDynamic.update({
        where: { id: relationshipDynamic.id },
        data: {
          status: validatedData.relationshipStatus,
        },
      });
    } else {
      relationshipDynamic = await db.relationshipDynamic.create({
        data: {
          userId: user.id,
          companionId: companion.id,
          status: validatedData.relationshipStatus,
        },
      });
    }

    // Create conversation if it doesn't exist
    const existingConversation = await db.conversation.findFirst({
      where: { userId: user.id, companionId: companion.id },
    });

    if (!existingConversation) {
      await db.conversation.create({
        data: {
          userId: user.id,
          companionId: companion.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          currentStep: user.currentStep,
          stepsCompleted: user.stepsCompleted,
        },
        companion: {
          id: companion.id,
          name: companion.name,
          gender: companion.gender,
        },
      },
    });
  } catch (error) {
    console.error("Basic details onboarding error:", error);

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

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        companions: true,
        relationshipDynamic: true,
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
        user: {
          name: user.name,
          age: user.age,
          location: user.location,
          occupation: user.occupation,
        },
        companion: companion
          ? {
              name: companion.name,
              gender: companion.gender,
              age: companion.age,
              location: companion.location,
              occupation: companion.occupation,
            }
          : null,
        relationshipStatus: relationshipDynamic?.status,
        currentStep: user.currentStep,
        stepsCompleted: user.stepsCompleted,
      },
    });
  } catch (error) {
    console.error("Get basic details error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
