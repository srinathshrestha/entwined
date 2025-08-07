import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { onboardingStep2Schema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate the request body
    const validationResult = onboardingStep2Schema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { user: userData, companion: companionData } = validationResult.data;

    // Get existing user
    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please complete step 1 first." },
        { status: 404 }
      );
    }

    // Update user with detailed character data
    await db.user.update({
      where: { id: user.id },
      data: {
        primaryTraits: userData.personalityTraits.primaryTraits,
        quirks: userData.quirks,
        deepPersonality: userData.deepPersonality,
        lifestyle: userData.lifestyle,
        cultural: userData.cultural,
        philosophy: userData.philosophy,
        professionalLife: userData.professionalLife,
        personalLife: userData.personalLife,
        additionalContext: userData.additionalContext,
        onboardingStep: Math.max(user.onboardingStep, 2),
      },
    });

    // Update companion with detailed character data
    const companion = await db.companion.findFirst({
      where: { userId: user.id },
    });

    if (!companion) {
      return NextResponse.json(
        { error: "Companion not found. Please complete step 1 first." },
        { status: 404 }
      );
    }

    await db.companion.update({
      where: { id: companion.id },
      data: {
        primaryTraits: companionData.personalityTraits.primaryTraits,
        quirks: companionData.quirks,
        deepPersonality: companionData.deepPersonality,
        lifestyle: companionData.lifestyle,
        cultural: companionData.cultural,
        philosophy: companionData.philosophy,
        professionalLife: companionData.professionalLife,
        personalLife: companionData.personalLife,
        additionalContext: companionData.additionalContext,
        communicationStyle: companionData.communicationStyle,
        personalityTowardsUser: companionData.personalityTowardsUser,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Step 2 completed successfully",
      user: {
        id: user.id,
        name: user.name,
        onboardingStep: Math.max(user.onboardingStep, 2),
      },
    });
  } catch (error) {
    console.error("Error saving step 2 data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
