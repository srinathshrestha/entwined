import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Simplified personality validation schema
const personalitySchema = z.object({
  name: z.string().min(1, "Companion name is required"),
  gender: z.enum(["male", "female", "non-binary"]),
  affectionLevel: z.number().min(1).max(10),
  empathyLevel: z.number().min(1).max(10),
  curiosityLevel: z.number().min(1).max(10),
  playfulness: z.number().min(1).max(10),
  humorStyle: z.enum(["playful", "witty", "gentle", "sarcastic", "serious"]),
  communicationStyle: z.enum(["casual", "formal", "intimate", "professional"]),
  userPreferredAddress: z.string().min(1, "Preferred address is required"),
  partnerPronouns: z.enum(["he/him", "she/her", "they/them", "other"]),
  avatarUrl: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = personalitySchema.parse(body);

    // Get or create user
    let user = await db.user.findUnique({
      where: { clerkId },
      include: { companions: true },
    });

    if (!user) {
      // Create user if doesn't exist
      user = await db.user.create({
        data: {
          clerkId,
          onboardingCompleted: false,
          currentStep: "personality",
        },
        include: { companions: true },
      });
    }

    // Create or update companion
    let companion;
    if (user.companions.length > 0) {
      // Update existing companion
      companion = await db.companion.update({
        where: { id: user.companions[0].id },
        data: {
          name: validatedData.name,
          gender: validatedData.gender,
          affectionLevel: validatedData.affectionLevel,
          empathyLevel: validatedData.empathyLevel,
          curiosityLevel: validatedData.curiosityLevel,
          playfulness: validatedData.playfulness,
          humorStyle: validatedData.humorStyle,
          communicationStyle: validatedData.communicationStyle,
          userPreferredAddress: validatedData.userPreferredAddress,
          partnerPronouns: validatedData.partnerPronouns,
          avatarUrl: validatedData.avatarUrl,
        },
      });
    } else {
      // Create new companion
      companion = await db.companion.create({
        data: {
          userId: user.id,
          name: validatedData.name,
          gender: validatedData.gender,
          affectionLevel: validatedData.affectionLevel,
          empathyLevel: validatedData.empathyLevel,
          curiosityLevel: validatedData.curiosityLevel,
          playfulness: validatedData.playfulness,
          humorStyle: validatedData.humorStyle,
          communicationStyle: validatedData.communicationStyle,
          userPreferredAddress: validatedData.userPreferredAddress,
          partnerPronouns: validatedData.partnerPronouns,
          avatarUrl: validatedData.avatarUrl,
        },
      });
    }

    // Mark onboarding as completed
    await db.user.update({
      where: { id: user.id },
      data: {
        onboardingCompleted: true,
        currentStep: "completed",
      },
    });

    return NextResponse.json({
      success: true,
      companion,
      message: "Personality setup completed successfully!",
    });
  } catch (error) {
    console.error("Error saving personality:", error);
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

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      include: { companions: true },
    });

    if (!user || !user.companions.length) {
      return NextResponse.json(
        { error: "No companion found" },
        { status: 404 }
      );
    }

    const companion = user.companions[0];

    return NextResponse.json({
      success: true,
      companion: {
        name: companion.name,
        gender: companion.gender,
        affectionLevel: companion.affectionLevel,
        empathyLevel: companion.empathyLevel,
        curiosityLevel: companion.curiosityLevel,
        playfulness: companion.playfulness,
        humorStyle: companion.humorStyle,
        communicationStyle: companion.communicationStyle,
        userPreferredAddress: companion.userPreferredAddress,
        partnerPronouns: companion.partnerPronouns,
        avatarUrl: companion.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Error fetching personality:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
