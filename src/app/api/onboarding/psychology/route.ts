import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Psychology profile validation schema
const userPsychologySchema = z.object({
  conflictStyle: z.enum([
    "avoids_conflict",
    "direct_confrontation",
    "passive_aggressive",
    "seeks_compromise",
  ]),
  emotionalExpression: z.enum([
    "highly_expressive",
    "reserved",
    "selective_sharing",
    "emotional_walls",
  ]),
  decisionMaking: z.enum([
    "impulsive",
    "analytical",
    "seeks_validation",
    "independent",
  ]),
  stressResponse: z.enum([
    "withdraws",
    "seeks_comfort",
    "becomes_irritable",
    "overthinks",
  ]),
  attachmentStyle: z.enum(["secure", "anxious", "avoidant", "disorganized"]),
  loveLanguage: z.enum([
    "words_of_affirmation",
    "physical_touch",
    "quality_time",
    "acts_of_service",
    "gifts",
  ]),
  vulnerabilityComfort: z.enum([
    "very_open",
    "selective",
    "guarded",
    "extremely_private",
  ]),
  authorityResponse: z.enum([
    "respects_authority",
    "questions_authority",
    "rebels_against_authority",
  ]),
  leadership: z.enum([
    "natural_leader",
    "prefers_following",
    "situational_leader",
    "avoids_responsibility",
  ]),
  primaryMotivations: z.array(z.string()),
  emotionalTriggers: z.array(z.string()),
  comfortSources: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = userPsychologySchema.parse(body);

    // Get existing user
    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please complete basic details first." },
        { status: 404 }
      );
    }

    // Update user with psychology profile
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        psychologyProfile: validatedData,
        currentStep: "companion",
        stepsCompleted: [...(user.stepsCompleted || []), "psychology"].filter(
          (step, index, arr) => arr.indexOf(step) === index
        ),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          currentStep: updatedUser.currentStep,
          stepsCompleted: updatedUser.stepsCompleted,
        },
      },
    });
  } catch (error) {
    console.error("Psychology onboarding error:", error);

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
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        psychologyProfile: user.psychologyProfile,
        currentStep: user.currentStep,
        stepsCompleted: user.stepsCompleted,
      },
    });
  } catch (error) {
    console.error("Get psychology profile error:", error);
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
    const validatedData = userPsychologySchema.parse(body);

    const user = await db.user.update({
      where: { clerkId },
      data: {
        psychologyProfile: validatedData,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        psychologyProfile: user.psychologyProfile,
      },
    });
  } catch (error) {
    console.error("Update psychology profile error:", error);

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
