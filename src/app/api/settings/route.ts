import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

// GET endpoint to load user settings
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user and their preferences
    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        preferences: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return settings based on preferences or defaults
    const preferences = user.preferences;
    const settings = {
      responseLength: preferences?.responseLength || "medium",
      emotionalIntensity: Math.round(
        (preferences?.emotionalDepth || 0.8) * 100
      ),
      initiativeLevel: Math.round((preferences?.creativityLevel || 0.7) * 100),
      memorySensitivity: preferences?.memoryImportanceThreshold || 3,
      memoryCreation: !preferences?.autoMemoryDeletion ?? true,
      blacklistedTopics: "", // This would need a separate field in preferences
      safeMode: preferences?.contentFiltering === "strict",
      autoDeleteDays:
        preferences?.memoryRetentionDays === 365
          ? "never"
          : preferences?.memoryRetentionDays?.toString() || "never",
    };

    return new Response(JSON.stringify({ settings }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error loading settings:", error);
    return new Response(JSON.stringify({ error: "Failed to load settings" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST endpoint to save user settings
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const settings = await req.json();

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId },
      include: { preferences: true },
    });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert settings back to preferences format
    const preferenceData = {
      responseLength: settings.responseLength || "medium",
      emotionalDepth: (settings.emotionalIntensity || 50) / 100,
      creativityLevel: (settings.initiativeLevel || 50) / 100,
      memoryImportanceThreshold: settings.memorySensitivity || 3,
      autoMemoryDeletion: !settings.memoryCreation,
      contentFiltering: settings.safeMode ? "strict" : "moderate",
      memoryRetentionDays:
        settings.autoDeleteDays === "never"
          ? 365
          : parseInt(settings.autoDeleteDays) || 365,
    };

    // Upsert user preferences
    await db.userPreferences.upsert({
      where: { userId: user.id },
      update: preferenceData,
      create: {
        userId: user.id,
        ...preferenceData,
      },
    });

    return new Response(JSON.stringify({ success: true, settings }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return new Response(JSON.stringify({ error: "Failed to save settings" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
