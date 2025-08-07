import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { onboardingStep3Schema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    const validationResult = onboardingStep3Schema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { relationship } = validationResult.data;

    // Get existing user
    const user = await db.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please complete previous steps first.' },
        { status: 404 }
      );
    }

    // Get companion
    const companion = await db.companion.findFirst({
      where: { userId: user.id },
    });

    if (!companion) {
      return NextResponse.json(
        { error: 'Companion not found. Please complete previous steps first.' },
        { status: 404 }
      );
    }

    // Update or create relationship dynamic
    await db.relationshipDynamic.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        companionId: companion.id,
        status: 'JUST_MET', // Default status, should be set in step 1
        originStory: relationship.originStory,
        currentSituation: relationship.currentSituation,
        communication: relationship.communication,
        intimacy: relationship.intimacy,
        roles: relationship.roles,
        sharedWorld: relationship.sharedWorld,
        memorableMoments: relationship.memorableMoments,
      },
      update: {
        originStory: relationship.originStory,
        currentSituation: relationship.currentSituation,
        communication: relationship.communication,
        intimacy: relationship.intimacy,
        roles: relationship.roles,
        sharedWorld: relationship.sharedWorld,
        memorableMoments: relationship.memorableMoments,
      },
    });

    // Update user onboarding step
    await db.user.update({
      where: { id: user.id },
      data: {
        onboardingStep: Math.max(user.onboardingStep, 3),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Step 3 completed successfully',
      user: {
        id: user.id,
        name: user.name,
        onboardingStep: Math.max(user.onboardingStep, 3),
      },
    });
  } catch (error) {
    console.error('Error saving step 3 data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 