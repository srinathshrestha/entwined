import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { onboardingStep4Schema } from '@/lib/validations';

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
    const validationResult = onboardingStep4Schema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { contentBoundaries } = validationResult.data;

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

    // Update relationship dynamic with content boundaries
    const relationshipDynamic = await db.relationshipDynamic.findUnique({
      where: { userId: user.id },
    });

    if (!relationshipDynamic) {
      return NextResponse.json(
        { error: 'Relationship dynamic not found. Please complete previous steps first.' },
        { status: 404 }
      );
    }

    await db.relationshipDynamic.update({
      where: { id: relationshipDynamic.id },
      data: {
        contentBoundaries,
      },
    });

    // Mark onboarding as completed
    await db.user.update({
      where: { id: user.id },
      data: {
        onboardingStep: 4,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully!',
      user: {
        id: user.id,
        name: user.name,
        onboardingStep: 4,
        onboardingCompleted: true,
      },
    });
  } catch (error) {
    console.error('Error saving step 4 data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 