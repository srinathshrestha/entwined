import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user exists in our database
    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        companions: true,
        relationshipDynamic: true,
      },
    });

    if (!user) {
      // User doesn't exist, needs to start onboarding
      return NextResponse.json({
        isComplete: false,
        currentStep: 1,
        hasProfile: false,
      });
    }

    // Check onboarding completion
    const hasBasicProfile = user.name && user.age && user.location && user.occupation;
    const hasCompanion = user.companions.length > 0;
    const hasRelationshipDynamic = user.relationshipDynamic !== null;
    const isOnboardingCompleted = user.onboardingCompleted;

    let currentStep = 1;
    
    if (!hasBasicProfile || !hasCompanion) {
      currentStep = 1;
    } else if (!user.primaryTraits.length || !user.companions[0]?.primaryTraits.length) {
      currentStep = 2;
    } else if (!hasRelationshipDynamic) {
      currentStep = 3;
    } else if (!isOnboardingCompleted) {
      currentStep = 4;
    }

    return NextResponse.json({
      isComplete: isOnboardingCompleted,
      currentStep,
      hasProfile: hasBasicProfile,
      user: {
        id: user.id,
        name: user.name,
        onboardingStep: user.onboardingStep,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 