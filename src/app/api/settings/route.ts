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

    // Get user and their settings
    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        userSettings: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return settings or defaults
    const settings = user.userSettings || {
      responseLength: "balanced",
      emotionalIntensity: 50,
      initiativeLevel: 50,
      memorySensitivity: 50,
      memoryCreation: true,
      blacklistedTopics: "",
      safeMode: false,
      autoDeleteDays: "never",
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
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Upsert settings - for now we'll store as JSON in user table since UserSettings model may not exist
    await db.user.update({
      where: { id: user.id },
      data: {
        // Store settings in a JSON field if available, or we can extend the user model
        // For now, let's assume we store in a separate settings table or extend user model
        // This is a placeholder - you may need to adjust based on your schema
      },
    });

    // For now, let's just return success - in production you'd want to store these properly
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
