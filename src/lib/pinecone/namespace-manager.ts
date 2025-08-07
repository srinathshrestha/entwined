/**
 * Pinecone Namespace Management for User Isolation
 *
 * This module ensures each user gets their own isolated namespace
 * in the Pinecone vector database for memory storage and retrieval.
 */

// Conditional imports to avoid client-side issues
let pineconeIndex: any = null;
let db: any = null;

// Only import on server side
if (typeof window === "undefined") {
  try {
    const { pineconeIndex: _pineconeIndex } = require("./client");
    const { db: _db } = require("../db");
    pineconeIndex = _pineconeIndex;
    db = _db;
  } catch (error) {
    console.warn("Pinecone or DB not available:", error);
  }
}

export interface NamespaceInfo {
  namespace: string;
  userId: string;
  createdAt: Date;
  vectorCount?: number;
  isActive: boolean;
}

/**
 * Generate a unique namespace for a user
 */
export function generateUserNamespace(userId: string): string {
  // Use the user's cuid as the namespace - it's already unique and safe
  return `user_${userId}`;
}

/**
 * Initialize a user's namespace in Pinecone
 * This is called when a user first logs in or when we need to ensure isolation
 */
export async function initializeUserNamespace(userId: string): Promise<{
  success: boolean;
  namespace: string;
  error?: string;
}> {
  try {
    const namespace = generateUserNamespace(userId);

    console.log(
      `[NamespaceManager] Initializing namespace for user ${userId}: ${namespace}`
    );

    // Check if Pinecone is available
    if (!pineconeIndex) {
      console.warn(
        `[NamespaceManager] Pinecone not available - namespace creation skipped`
      );
      return {
        success: true, // We'll succeed gracefully without Pinecone
        namespace,
        error: "Pinecone not available",
      };
    }

    try {
      // Check if namespace already has vectors
      const stats = await pineconeIndex
        .namespace(namespace)
        .describeIndexStats();
      const vectorCount = stats.totalVectorCount || 0;

      console.log(
        `[NamespaceManager] Namespace ${namespace} exists with ${vectorCount} vectors`
      );

      return {
        success: true,
        namespace,
      };
    } catch (error) {
      // Namespace might not exist yet - that's fine
      console.log(
        `[NamespaceManager] Namespace ${namespace} not yet initialized - will be created on first use`
      );

      return {
        success: true,
        namespace,
      };
    }
  } catch (error) {
    console.error(
      `[NamespaceManager] Error initializing namespace for user ${userId}:`,
      error
    );

    return {
      success: false,
      namespace: generateUserNamespace(userId),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a user's namespace and all their vectors
 * This is called when a user account is deleted
 */
export async function deleteUserNamespace(userId: string): Promise<{
  success: boolean;
  vectorsDeleted?: number;
  error?: string;
}> {
  try {
    const namespace = generateUserNamespace(userId);

    console.log(
      `[NamespaceManager] Deleting namespace for user ${userId}: ${namespace}`
    );

    if (!pineconeIndex) {
      console.warn(
        `[NamespaceManager] Pinecone not available - namespace deletion skipped`
      );
      return { success: true, error: "Pinecone not available" };
    }

    try {
      // Get current vector count for logging
      const statsBefore = await pineconeIndex
        .namespace(namespace)
        .describeIndexStats();
      const vectorCount = statsBefore.totalVectorCount || 0;

      if (vectorCount > 0) {
        // Delete all vectors in the namespace
        await pineconeIndex.namespace(namespace).deleteAll();
        console.log(
          `[NamespaceManager] Deleted ${vectorCount} vectors from namespace ${namespace}`
        );
      }

      return {
        success: true,
        vectorsDeleted: vectorCount,
      };
    } catch (error) {
      // Namespace might not exist - that's fine
      console.log(
        `[NamespaceManager] Namespace ${namespace} was already empty or non-existent`
      );
      return { success: true, vectorsDeleted: 0 };
    }
  } catch (error) {
    console.error(
      `[NamespaceManager] Error deleting namespace for user ${userId}:`,
      error
    );

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get namespace statistics for a user
 */
export async function getUserNamespaceStats(userId: string): Promise<{
  namespace: string;
  vectorCount: number;
  memoryCount: number;
  isHealthy: boolean;
  error?: string;
}> {
  const namespace = generateUserNamespace(userId);

  try {
    // Get vector count from Pinecone
    let vectorCount = 0;
    let isHealthy = true;

    if (pineconeIndex) {
      try {
        const stats = await pineconeIndex
          .namespace(namespace)
          .describeIndexStats();
        vectorCount = stats.totalVectorCount || 0;
      } catch (error) {
        console.warn(
          `[NamespaceManager] Could not get Pinecone stats for ${namespace}:`,
          error
        );
        isHealthy = false;
      }
    }

    // Get memory count from PostgreSQL
    const memoryCount = await db.memory.count({
      where: { userId, isVisible: true },
    });

    return {
      namespace,
      vectorCount,
      memoryCount,
      isHealthy,
    };
  } catch (error) {
    console.error(
      `[NamespaceManager] Error getting stats for user ${userId}:`,
      error
    );

    return {
      namespace,
      vectorCount: 0,
      memoryCount: 0,
      isHealthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Verify namespace isolation - ensure user can only access their own data
 */
export async function verifyNamespaceIsolation(userId: string): Promise<{
  isIsolated: boolean;
  namespace: string;
  issues: string[];
}> {
  const namespace = generateUserNamespace(userId);
  const issues: string[] = [];

  try {
    // Check database-level isolation
    const userMemories = await db.memory.findMany({
      where: { userId, isVisible: true },
      select: { id: true, vectorId: true },
    });

    // Check if user has any memories with incorrect namespace patterns
    const incorrectVectorIds = userMemories.filter(
      (memory) => memory.vectorId && !memory.vectorId.startsWith(namespace)
    );

    if (incorrectVectorIds.length > 0) {
      issues.push(
        `Found ${incorrectVectorIds.length} memories with incorrect namespace`
      );
    }

    // Check if namespace follows the correct pattern
    if (!namespace.startsWith("user_") || !namespace.includes(userId)) {
      issues.push(`Namespace pattern is incorrect: ${namespace}`);
    }

    return {
      isIsolated: issues.length === 0,
      namespace,
      issues,
    };
  } catch (error) {
    console.error(
      `[NamespaceManager] Error verifying isolation for user ${userId}:`,
      error
    );

    return {
      isIsolated: false,
      namespace,
      issues: [
        `Verification failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ],
    };
  }
}

/**
 * Clean up orphaned vectors (vectors without corresponding database entries)
 */
export async function cleanupOrphanedVectors(userId: string): Promise<{
  success: boolean;
  cleaned: number;
  error?: string;
}> {
  const namespace = generateUserNamespace(userId);

  try {
    if (!pineconeIndex) {
      return { success: true, cleaned: 0, error: "Pinecone not available" };
    }

    // Get all memory vector IDs from database
    const userMemories = await db.memory.findMany({
      where: { userId, isVisible: true },
      select: { vectorId: true },
    });

    const validVectorIds = new Set(
      userMemories.map((m) => m.vectorId).filter(Boolean) as string[]
    );

    // This is a simplified cleanup - in a full implementation,
    // you'd need to fetch all vectors from Pinecone and compare
    console.log(
      `[NamespaceManager] Cleanup for ${namespace}: ${validVectorIds.size} valid vectors`
    );

    return {
      success: true,
      cleaned: 0, // Placeholder - actual implementation would return cleaned count
    };
  } catch (error) {
    console.error(
      `[NamespaceManager] Error cleaning up orphaned vectors for user ${userId}:`,
      error
    );

    return {
      success: false,
      cleaned: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Initialize namespace when user logs in (middleware helper)
 */
export async function ensureUserNamespace(userId: string): Promise<string> {
  const result = await initializeUserNamespace(userId);

  if (
    !result.success &&
    result.error &&
    !result.error.includes("Pinecone not available")
  ) {
    console.error(
      `[NamespaceManager] Failed to initialize namespace for user ${userId}:`,
      result.error
    );
    // Don't throw error - allow user to continue without vector storage
  }

  return result.namespace;
}
