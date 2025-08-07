import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { onboardingStep1Schema } from '@/lib/validations';

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
    const validationResult = onboardingStep1Schema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { user: userData, companion: companionData, relationship } = validationResult.data;

    // Create or update user
    const user = await db.user.upsert({
      where: { clerkId },
      create: {
        clerkId,
        email: '', // Will be updated from Clerk if available
        name: userData.name,
        age: userData.age,
        location: userData.location,
        occupation: userData.occupation,
        onboardingStep: 1,
        onboardingCompleted: false,
      },
      update: {
        name: userData.name,
        age: userData.age,
        location: userData.location,
        occupation: userData.occupation,
        onboardingStep: Math.max(1, 1), // Ensure we don't go backwards
      },
    });

    // Create or update companion
    let companion = await db.companion.findFirst({
      where: { userId: user.id },
    });

    if (companion) {
      // Update existing companion
      companion = await db.companion.update({
        where: { id: companion.id },
        data: {
          name: companionData.name,
          gender: companionData.gender,
          age: companionData.age,
          location: companionData.location,
          occupation: companionData.occupation,
        },
      });
    } else {
      // Create new companion
      companion = await db.companion.create({
        data: {
          userId: user.id,
          name: companionData.name,
          gender: companionData.gender,
          age: companionData.age,
          location: companionData.location,
          occupation: companionData.occupation,
        },
      });
    }

    if (companion) {
      // Create or update relationship dynamic
      await db.relationshipDynamic.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          companionId: companion.id,
          status: relationship.status,
        },
        update: {
          status: relationship.status,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Step 1 completed successfully',
      user: {
        id: user.id,
        name: user.name,
        onboardingStep: user.onboardingStep,
      },
    });
  } catch (error) {
    console.error('Error saving step 1 data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 