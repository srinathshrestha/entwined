/**
 * Database Cleanup Script
 *
 * This script helps clean up the database for a fresh start while maintaining
 * schema integrity. Run this before deleting users from Clerk dashboard.
 */

import { PrismaClient } from "@prisma/client";

// Dynamic import to avoid client-side issues
async function getNamespaceManager() {
  try {
    const { deleteUserNamespace } = await import(
      "../lib/pinecone/namespace-manager"
    );
    return { deleteUserNamespace };
  } catch (error) {
    console.warn("Namespace manager not available:", error);
    return {
      deleteUserNamespace: async () => ({ success: true, vectorsDeleted: 0 }),
    };
  }
}

const db = new PrismaClient();

async function cleanupDatabase() {
  console.log("🧹 Starting database cleanup...");

  try {
    // Get all users before deletion for Pinecone cleanup
    const users = await db.user.findMany({
      select: { id: true, clerkId: true, name: true },
    });

    console.log(`Found ${users.length} users to clean up`);

    // Clean up Pinecone namespaces for each user
    console.log("🗑️  Cleaning up Pinecone namespaces...");
    const { deleteUserNamespace } = await getNamespaceManager();

    for (const user of users) {
      try {
        const result = await deleteUserNamespace(user.id);
        if (result.success) {
          console.log(
            `✅ Cleaned namespace for user ${user.name || user.clerkId}: ${
              result.vectorsDeleted || 0
            } vectors deleted`
          );
        } else {
          console.warn(
            `⚠️  Failed to clean namespace for user ${user.clerkId}: ${result.error}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Error cleaning namespace for user ${user.clerkId}:`,
          error
        );
      }
    }

    // Delete data in correct order to respect foreign key constraints
    console.log("🗑️  Deleting database records...");

    // Delete conversation sessions first
    const deletedSessions = await db.conversationSession.deleteMany({});
    console.log(`✅ Deleted ${deletedSessions.count} conversation sessions`);

    // Delete messages
    const deletedMessages = await db.message.deleteMany({});
    console.log(`✅ Deleted ${deletedMessages.count} messages`);

    // Delete conversations
    const deletedConversations = await db.conversation.deleteMany({});
    console.log(`✅ Deleted ${deletedConversations.count} conversations`);

    // Delete memories
    const deletedMemories = await db.memory.deleteMany({});
    console.log(`✅ Deleted ${deletedMemories.count} memories`);

    // Delete user preferences
    const deletedPreferences = await db.userPreferences.deleteMany({});
    console.log(`✅ Deleted ${deletedPreferences.count} user preferences`);

    // Delete relationship dynamics
    const deletedRelationships = await db.relationshipDynamic.deleteMany({});
    console.log(
      `✅ Deleted ${deletedRelationships.count} relationship dynamics`
    );

    // Delete companions
    const deletedCompanions = await db.companion.deleteMany({});
    console.log(`✅ Deleted ${deletedCompanions.count} companions`);

    // Finally delete users
    const deletedUsers = await db.user.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.count} users`);

    console.log("🎉 Database cleanup completed successfully!");
    console.log("");
    console.log("Next steps:");
    console.log("1. Delete users from Clerk dashboard");
    console.log("2. Restart the application");
    console.log("3. Test with new user registration");
  } catch (error) {
    console.error("❌ Error during database cleanup:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

async function resetDatabase() {
  console.log("🔄 Resetting database to clean state...");

  try {
    // This is a more aggressive reset that doesn't preserve anything
    await db.$executeRaw`TRUNCATE TABLE "conversation_sessions" CASCADE;`;
    await db.$executeRaw`TRUNCATE TABLE "messages" CASCADE;`;
    await db.$executeRaw`TRUNCATE TABLE "conversations" CASCADE;`;
    await db.$executeRaw`TRUNCATE TABLE "memories" CASCADE;`;
    await db.$executeRaw`TRUNCATE TABLE "user_preferences" CASCADE;`;
    await db.$executeRaw`TRUNCATE TABLE "relationship_dynamics" CASCADE;`;
    await db.$executeRaw`TRUNCATE TABLE "companions" CASCADE;`;
    await db.$executeRaw`TRUNCATE TABLE "users" CASCADE;`;

    console.log("🎉 Database reset completed!");
  } catch (error) {
    console.error("❌ Error during database reset:", error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Allow script to be run with different modes
const mode = process.argv[2] || "cleanup";

if (mode === "reset") {
  resetDatabase().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
} else {
  cleanupDatabase().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
}

/*
Usage:

1. Normal cleanup (preserves foreign key constraints):
   npx tsx src/scripts/cleanup-database.ts

2. Aggressive reset (uses TRUNCATE):
   npx tsx src/scripts/cleanup-database.ts reset

3. Add to package.json scripts:
   "cleanup:db": "tsx src/scripts/cleanup-database.ts",
   "reset:db": "tsx src/scripts/cleanup-database.ts reset"
*/
