import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Partner design validation schema
const partnerDesignSchema = z.object({
  dominanceLevel: z.enum([
    "highly_dominant",
    "assertive",
    "balanced",
    "submissive",
    "highly_submissive",
  ]),
  emotionalRange: z.enum([
    "very_expressive",
    "moderately_expressive",
    "controlled",
    "stoic",
  ]),
  adaptability: z.enum([
    "highly_adaptive",
    "somewhat_flexible",
    "consistent",
    "rigid",
  ]),
  userMisbehavior: z.enum([
    "authoritative_correction",
    "gentle_guidance",
    "playful_teasing",
    "ignores_it",
  ]),
  userSadness: z.enum([
    "immediate_comfort",
    "problem_solving",
    "distraction",
    "gives_space",
  ]),
  userAnger: z.enum([
    "calming_presence",
    "matches_energy",
    "defensive",
    "withdraws",
  ]),
  userExcitement: z.enum([
    "matches_enthusiasm",
    "gentle_grounding",
    "supportive_observer",
  ]),
  conflictApproach: z.enum([
    "direct_discussion",
    "emotional_appeal",
    "logical_reasoning",
    "avoids_conflict",
  ]),
  affectionStyle: z.enum([
    "very_physical",
    "verbally_loving",
    "acts_of_service",
    "quality_time",
  ]),
  humorStyle: z.enum([
    "playful_teasing",
    "witty_banter",
    "gentle_humor",
    "serious_nature",
  ]),
  protectiveness: z.enum([
    "highly_protective",
    "supportive",
    "encouraging_independence",
  ]),
  initiative: z.enum(["takes_charge", "collaborative", "follows_user_lead"]),
  jealousyLevel: z.enum([
    "very_jealous",
    "mildly_jealous",
    "secure",
    "encourages_friendships",
  ]),
});

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = partnerDesignSchema.parse(body);

    // Get existing user
    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        companions: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please complete basic details first." },
        { status: 404 }
      );
    }

    const companion = user.companions[0];
    if (!companion) {
      return NextResponse.json(
        { error: "Companion not found. Please complete basic details first." },
        { status: 404 }
      );
    }

    // Update companion with behavioral design
    const updatedCompanion = await db.companion.update({
      where: { id: companion.id },
      data: {
        behavioralDesign: validatedData,
        personalityVersion: companion.personalityVersion + 1,
      },
    });

    // Update user progress
    await db.user.update({
      where: { id: user.id },
      data: {
        currentStep: "relationship",
        stepsCompleted: [...(user.stepsCompleted || []), "companion"].filter(
          (step, index, arr) => arr.indexOf(step) === index
        ),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        companion: {
          id: updatedCompanion.id,
          name: updatedCompanion.name,
          behavioralDesign: updatedCompanion.behavioralDesign,
        },
      },
    });
  } catch (error) {
    console.error("Companion design onboarding error:", error);

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
        companions: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const companion = user.companions[0];
    if (!companion) {
      return NextResponse.json(
        { error: "Companion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        name: companion.name,
        gender: companion.gender,
        behavioralDesign: companion.behavioralDesign,
        currentStep: user.currentStep,
        stepsCompleted: user.stepsCompleted,
      },
    });
  } catch (error) {
    console.error("Get companion data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
