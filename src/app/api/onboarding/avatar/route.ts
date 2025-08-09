import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Avatar selection validation schema
const avatarSelectionSchema = z.object({
  avatarUrl: z.string().min(1, "Avatar URL is required"),
  avatarCategory: z.string().min(1, "Avatar category is required"), // romantic, intimate, companion
  avatarPersonality: z.string().min(1, "Avatar personality is required"), // se, te, al, de, etc.
});

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = avatarSelectionSchema.parse(body);

    // Get existing user and companion
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

    // Update companion with avatar
    const updatedCompanion = await db.companion.update({
      where: { id: companion.id },
      data: {
        avatarUrl: validatedData.avatarUrl,
        avatarCategory: validatedData.avatarCategory,
        avatarPersonality: validatedData.avatarPersonality,
      },
    });

    // Mark onboarding as complete
    await db.user.update({
      where: { id: user.id },
      data: {
        onboardingCompleted: true,
        currentStep: "completed",
        stepsCompleted: [...(user.stepsCompleted || []), "avatar"].filter(
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
          avatarUrl: updatedCompanion.avatarUrl,
          avatarCategory: updatedCompanion.avatarCategory,
        },
        onboardingCompleted: true,
      },
    });
  } catch (error) {
    console.error("Avatar selection onboarding error:", error);

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
        avatarUrl: companion.avatarUrl,
        avatarCategory: companion.avatarCategory,
        avatarPersonality: companion.avatarPersonality,
        currentStep: user.currentStep,
        stepsCompleted: user.stepsCompleted,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error("Get avatar data error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
