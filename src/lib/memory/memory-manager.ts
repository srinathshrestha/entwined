import { db } from "../db";
import { deleteMemoryVector } from "../pinecone/memory-storage";

export interface MemoryStats {
  total: number;
  byImportance: Record<string, number>;
  byCategory: Record<string, number>;
  averageImportance: number;
  oldestMemory: Date | null;
  newestMemory: Date | null;
}

/**
 * Comprehensive memory management utility
 * Handles edge cases, limits, conflicts, and optimization
 */
export class MemoryManager {
  private readonly MAX_MEMORIES_PER_USER = 5000; // Maximum memories per user
  private readonly LOW_IMPORTANCE_THRESHOLD = 3; // Memories below this may be pruned
  private readonly DAYS_TO_KEEP_LOW_IMPORTANCE = 90; // Days to keep low importance memories

  /**
   * Check if user is approaching memory limits and handle appropriately
   */
  async checkAndHandleMemoryLimits(userId: string): Promise<{
    withinLimits: boolean;
    totalCount: number;
    action?: string;
  }> {
    try {
      const stats = await this.getMemoryStats(userId);

      if (stats.total < this.MAX_MEMORIES_PER_USER * 0.8) {
        // Well within limits
        return {
          withinLimits: true,
          totalCount: stats.total,
        };
      }

      if (stats.total >= this.MAX_MEMORIES_PER_USER) {
        // At limit - need to prune old/low importance memories
        console.warn(
          `User ${userId} has reached memory limit (${stats.total}), pruning...`
        );
        const pruned = await this.pruneOldMemories(userId, 500); // Remove 500 memories

        return {
          withinLimits: false,
          totalCount: stats.total - pruned,
          action: `Pruned ${pruned} old/low importance memories`,
        };
      }

      // Approaching limit - prune some low importance memories
      console.log(
        `User ${userId} approaching memory limit (${stats.total}), light pruning...`
      );
      const pruned = await this.pruneOldMemories(userId, 100);

      return {
        withinLimits: true,
        totalCount: stats.total - pruned,
        action: `Pruned ${pruned} low importance memories`,
      };
    } catch (error) {
      console.error("Failed to check memory limits:", error);
      return {
        withinLimits: true, // Assume OK if check fails
        totalCount: 0,
      };
    }
  }

  /**
   * Get comprehensive memory statistics for a user
   */
  async getMemoryStats(userId: string): Promise<MemoryStats> {
    try {
      const memories = await db.memory.findMany({
        where: {
          userId,
          isVisible: true,
        },
        select: {
          importance: true,
          category: true,
          createdAt: true,
        },
      });

      const stats: MemoryStats = {
        total: memories.length,
        byImportance: {},
        byCategory: {},
        averageImportance: 0,
        oldestMemory: null,
        newestMemory: null,
      };

      if (memories.length === 0) {
        return stats;
      }

      let totalImportance = 0;
      let oldestDate = memories[0].createdAt;
      let newestDate = memories[0].createdAt;

      for (const memory of memories) {
        // Count by importance level
        const importanceLevel = memory.importance.toString();
        stats.byImportance[importanceLevel] =
          (stats.byImportance[importanceLevel] || 0) + 1;

        // Count by category
        const category = memory.category || "general";
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

        // Sum importance
        totalImportance += memory.importance;

        // Track date range
        if (memory.createdAt < oldestDate) {
          oldestDate = memory.createdAt;
        }
        if (memory.createdAt > newestDate) {
          newestDate = memory.createdAt;
        }
      }

      stats.averageImportance =
        Math.round((totalImportance / memories.length) * 10) / 10;
      stats.oldestMemory = oldestDate;
      stats.newestMemory = newestDate;

      return stats;
    } catch (error) {
      console.error("Failed to get memory stats:", error);
      return {
        total: 0,
        byImportance: {},
        byCategory: {},
        averageImportance: 0,
        oldestMemory: null,
        newestMemory: null,
      };
    }
  }

  /**
   * Prune old and low importance memories
   */
  async pruneOldMemories(
    userId: string,
    targetCount: number = 100
  ): Promise<number> {
    try {
      // Find candidates for pruning - prioritize old, low importance, rarely accessed
      const candidates = await db.memory.findMany({
        where: {
          userId,
          isVisible: true,
          OR: [
            // Low importance memories older than threshold
            {
              importance: { lte: this.LOW_IMPORTANCE_THRESHOLD },
              createdAt: {
                lte: new Date(
                  Date.now() -
                    this.DAYS_TO_KEEP_LOW_IMPORTANCE * 24 * 60 * 60 * 1000
                ),
              },
            },
            // Very old memories regardless of importance (older than 1 year)
            {
              createdAt: {
                lte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
        orderBy: [
          { importance: "asc" },
          { accessCount: "asc" },
          { createdAt: "asc" },
        ],
        take: targetCount,
      });

      if (candidates.length === 0) {
        console.log("No memories found for pruning");
        return 0;
      }

      console.log(`Pruning ${candidates.length} memories for user ${userId}`);

      // Delete from both PostgreSQL and Pinecone
      const deletionResults = await Promise.allSettled(
        candidates.map(async (memory) => {
          try {
            // Delete from PostgreSQL
            await db.memory.update({
              where: { id: memory.id },
              data: { isVisible: false }, // Soft delete
            });

            // Delete from Pinecone if vector exists
            if (memory.vectorId) {
              await deleteMemoryVector(userId, memory.id);
            }

            return { success: true, memoryId: memory.id };
          } catch (error) {
            console.error(`Failed to delete memory ${memory.id}:`, error);
            return { success: false, memoryId: memory.id, error };
          }
        })
      );

      const successful = deletionResults.filter(
        (result) => result.status === "fulfilled" && result.value.success
      ).length;

      console.log(`Successfully pruned ${successful} memories`);
      return successful;
    } catch (error) {
      console.error("Failed to prune memories:", error);
      return 0;
    }
  }

  /**
   * Detect and resolve memory conflicts (duplicate or contradictory information)
   */
  async detectMemoryConflicts(userId: string): Promise<{
    conflicts: Array<{
      type: "duplicate" | "contradiction";
      memories: Array<{ id: string; content: string; importance: number }>;
      recommendation: string;
    }>;
    resolved: number;
  }> {
    try {
      // Find potential duplicates based on similar content
      const memories = await db.memory.findMany({
        where: {
          userId,
          isVisible: true,
        },
        select: {
          id: true,
          content: true,
          importance: true,
          type: true,
          category: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const conflicts: Array<{
        type: "duplicate" | "contradiction";
        memories: Array<{ id: string; content: string; importance: number }>;
        recommendation: string;
      }> = [];

      // Simple duplicate detection based on content similarity
      for (let i = 0; i < memories.length; i++) {
        for (let j = i + 1; j < memories.length; j++) {
          const memory1 = memories[i];
          const memory2 = memories[j];

          // Skip if different types/categories
          if (
            memory1.type !== memory2.type ||
            memory1.category !== memory2.category
          ) {
            continue;
          }

          // Check for very similar content (simple text similarity)
          const similarity = this.calculateTextSimilarity(
            memory1.content,
            memory2.content
          );

          if (similarity > 0.8) {
            conflicts.push({
              type: "duplicate",
              memories: [
                {
                  id: memory1.id,
                  content: memory1.content,
                  importance: memory1.importance,
                },
                {
                  id: memory2.id,
                  content: memory2.content,
                  importance: memory2.importance,
                },
              ],
              recommendation:
                memory1.importance >= memory2.importance
                  ? `Keep memory ${memory1.id} (higher importance)`
                  : `Keep memory ${memory2.id} (higher importance)`,
            });
          }
        }
      }

      // Auto-resolve obvious duplicates
      let resolved = 0;
      for (const conflict of conflicts) {
        if (conflict.type === "duplicate" && conflict.memories.length === 2) {
          try {
            // Keep the more important one, hide the less important
            const [memory1, memory2] = conflict.memories;
            const toHide =
              memory1.importance >= memory2.importance
                ? memory2.id
                : memory1.id;

            await db.memory.update({
              where: { id: toHide },
              data: { isVisible: false },
            });

            resolved++;
          } catch (error) {
            console.error("Failed to resolve conflict:", error);
          }
        }
      }

      return { conflicts, resolved };
    } catch (error) {
      console.error("Failed to detect memory conflicts:", error);
      return { conflicts: [], resolved: 0 };
    }
  }

  /**
   * Optimize memory storage by updating importance scores based on usage
   */
  async optimizeMemoryImportance(userId: string): Promise<{
    updated: number;
    promotions: number;
    demotions: number;
  }> {
    try {
      const memories = await db.memory.findMany({
        where: {
          userId,
          isVisible: true,
        },
        select: {
          id: true,
          importance: true,
          accessCount: true,
          lastAccessed: true,
          createdAt: true,
        },
      });

      let updated = 0;
      let promotions = 0;
      let demotions = 0;

      for (const memory of memories) {
        const originalImportance = memory.importance;
        let newImportance = originalImportance;

        // Promote frequently accessed memories
        if (memory.accessCount >= 10) {
          newImportance = Math.min(10, originalImportance + 1);
        } else if (memory.accessCount >= 5) {
          newImportance = Math.min(10, originalImportance + 0.5);
        }

        // Demote rarely accessed old memories
        const daysSinceCreated =
          (Date.now() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated > 30 && memory.accessCount === 0) {
          newImportance = Math.max(1, originalImportance - 1);
        }

        // Update if changed
        if (newImportance !== originalImportance) {
          await db.memory.update({
            where: { id: memory.id },
            data: { importance: Math.round(newImportance) },
          });

          updated++;
          if (newImportance > originalImportance) {
            promotions++;
          } else {
            demotions++;
          }
        }
      }

      console.log(
        `Optimized ${updated} memories: ${promotions} promoted, ${demotions} demoted`
      );
      return { updated, promotions, demotions };
    } catch (error) {
      console.error("Failed to optimize memory importance:", error);
      return { updated: 0, promotions: 0, demotions: 0 };
    }
  }

  /**
   * Calculate simple text similarity between two strings
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);

    const intersection = words1.filter((word) => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];

    return union.length > 0 ? intersection.length / union.length : 0;
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager();
