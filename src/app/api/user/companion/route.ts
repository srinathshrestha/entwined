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

    // Get user and their companion
    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        companions: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.companions.length === 0) {
      return NextResponse.json(
        { error: 'No companion found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    const companion = user.companions[0]; // Get first companion

    return NextResponse.json({
      companion: {
        id: companion.id,
        name: companion.name,
        gender: companion.gender,
        age: companion.age,
        location: companion.location,
        occupation: companion.occupation,
        avatarUrl: companion.avatarUrl,
        avatarCategory: companion.avatarCategory,
        avatarPersonality: companion.avatarPersonality,
      },
    });
  } catch (error) {
    console.error('Error fetching companion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 