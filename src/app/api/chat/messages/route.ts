import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

// DELETE endpoint to delete a message
export async function DELETE(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get messageId from URL search params
    const url = new URL(req.url);
    const messageId = url.searchParams.get("messageId");

    if (!messageId) {
      return new Response(JSON.stringify({ error: "Message ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user to verify ownership
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find the message and verify it belongs to the user
    const message = await db.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: true,
      },
    });

    if (!message) {
      return new Response(JSON.stringify({ error: "Message not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify the message belongs to the user's conversation
    if (message.conversation.userId !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Soft delete the message by setting isDeleted flag
    await db.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    return new Response(JSON.stringify({ error: "Failed to delete message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// PATCH endpoint to bulk delete messages by date range
export async function PATCH(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { startDate, endDate, messageIds } = body;

    // Get user
    const user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build the where clause based on the request
    let whereClause: Record<string, any>;

    if (messageIds && messageIds.length > 0) {
      whereClause = {
        conversation: { userId: user.id },
        id: { in: messageIds },
      };
    } else if (startDate && endDate) {
      whereClause = {
        conversation: { userId: user.id },
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    } else {
      return new Response(
        JSON.stringify({ error: "Either messageIds or date range required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Bulk soft delete messages
    const result = await db.message.updateMany({
      where: whereClause,
      data: { isDeleted: true },
    });

    return new Response(
      JSON.stringify({ success: true, deletedCount: result.count }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error bulk deleting messages:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete messages" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
