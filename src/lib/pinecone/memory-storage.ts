import { pineconeIndex, getUserNamespace } from "./client";
import { generateEmbedding } from "../ai/embeddings";
import { db } from "../db";

/**
 * Store a memory vector in Pinecone with deduplication and robust error handling
 * This function ensures that even if Pinecone fails, the main chat flow continues
 */
export async function storeMemoryVector(
  userId: string,
  memoryId: string,
  content: string,
  metadata: {
    type: string;
    importance: number;
    category: string;
    createdAt: string;
  }
): Promise<{ success: boolean; error?: string; isDuplicate?: boolean }> {
  try {
    // Validate inputs
    if (!userId || !memoryId || !content) {
      console.warn("Invalid parameters for memory storage:", {
        userId,
        memoryId,
        content: content?.slice(0, 50),
      });
      return { success: false, error: "Missing required parameters" };
    }

    // Check if Pinecone is available by testing the connection
    if (!pineconeIndex) {
      console.warn("Pinecone index not available");
      return { success: false, error: "Vector database unavailable" };
    }

    // Generate embedding using our robust embedding service
    const embedding = await generateEmbedding(content);

    if (!embedding || embedding.length === 0) {
      console.warn(
        "Failed to generate embedding for content:",
        content.slice(0, 100)
      );
      return { success: false, error: "Embedding generation failed" };
    }

    // Check for duplicates using cosine similarity (>0.9 threshold)
    const duplicateCheck = await checkForDuplicateMemory(userId, embedding);
    if (duplicateCheck.isDuplicate) {
      console.log("Duplicate memory detected, skipping storage:", {
        memoryId,
        similarity: duplicateCheck.similarity,
        existingMemoryId: duplicateCheck.existingMemoryId,
      });
      return {
        success: true,
        isDuplicate: true,
        error: `Similar memory already exists (similarity: ${duplicateCheck.similarity})`,
      };
    }

    // Prepare metadata with additional context
    const vectorMetadata = {
      content: content.slice(0, 1000), // Limit content size in metadata
      userId,
      type: metadata.type,
      importance: metadata.importance,
      category: metadata.category || "general",
      createdAt: metadata.createdAt,
      lastAccessed: new Date().toISOString(),
      accessCount: 0,
    };

    // Upsert vector to Pinecone with retry logic
    await upsertVectorWithRetry(
      userId,
      memoryId,
      embedding,
      vectorMetadata,
      3 // max retries
    );

    // Update the memory record in PostgreSQL with vector ID
    try {
      await db.memory.update({
        where: { id: memoryId },
        data: {
          vectorId: memoryId,
          embeddingMeta: {
            model: "text-embedding-3-small",
            dimensions: embedding.length,
            storedAt: new Date().toISOString(),
          },
        },
      });
    } catch (dbError) {
      console.warn("Failed to update memory with vector ID:", dbError);
      // This is not critical - the vector is still stored
    }

    console.log(
      `Successfully stored memory vector for user ${userId}, memory ${memoryId}`
    );
    return { success: true };
  } catch (error) {
    console.error("Failed to store memory vector:", error);

    // Return specific error messages for different failure types
    if (error instanceof Error) {
      if (error.message.includes("404")) {
        return {
          success: false,
          error: "Pinecone index not found - please check configuration",
        };
      }
      if (error.message.includes("401") || error.message.includes("403")) {
        return { success: false, error: "Pinecone authentication failed" };
      }
      if (error.message.includes("rate limit")) {
        return {
          success: false,
          error: "Rate limit exceeded - will retry later",
        };
      }
      if (error.message.includes("network")) {
        return {
          success: false,
          error: "Network error connecting to Pinecone",
        };
      }
    }

    return {
      success: false,
      error: `Unexpected error: ${
        error instanceof Error ? error.message : "Unknown"
      }`,
    };
  }
}

interface VectorMetadata {
  content: string;
  userId: string;
  type: string;
  importance: number;
  category: string;
  createdAt: string;
  lastAccessed: string;
  accessCount: number;
  [key: string]: string | number; // Index signature for Pinecone compatibility
}

/**
 * Upsert vector to Pinecone with exponential backoff retry
 */
async function upsertVectorWithRetry(
  userId: string,
  memoryId: string,
  embedding: number[],
  metadata: VectorMetadata,
  maxRetries: number
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await pineconeIndex.namespace(getUserNamespace(userId)).upsert([
        {
          id: memoryId,
          values: embedding,
          metadata,
        },
      ]);

      // Success - exit retry loop
      return;
    } catch (error) {
      console.warn(`Pinecone upsert attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        // Last attempt - throw the error
        throw error;
      }

      // Wait before retry with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Batch store multiple memory vectors
 * Useful for initial data migration or bulk operations
 */
export async function storeMemoryVectorsBatch(
  userId: string,
  memories: Array<{
    memoryId: string;
    content: string;
    metadata: {
      type: string;
      importance: number;
      category: string;
      createdAt: string;
    };
  }>,
  batchSize: number = 5
): Promise<{
  successful: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Process in batches to avoid overwhelming Pinecone
  for (let i = 0; i < memories.length; i += batchSize) {
    const batch = memories.slice(i, i + batchSize);

    const batchPromises = batch.map(async (memory) => {
      try {
        const result = await storeMemoryVector(
          userId,
          memory.memoryId,
          memory.content,
          memory.metadata
        );

        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
          if (result.error) {
            results.errors.push(`Memory ${memory.memoryId}: ${result.error}`);
          }
        }
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Memory ${memory.memoryId}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });

    await Promise.all(batchPromises);

    // Add delay between batches
    if (i + batchSize < memories.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return results;
}

/**
 * Delete a memory vector from Pinecone
 */
export async function deleteMemoryVector(
  userId: string,
  memoryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId || !memoryId) {
      return { success: false, error: "Missing required parameters" };
    }

    await pineconeIndex.namespace(getUserNamespace(userId)).deleteOne(memoryId);

    console.log(
      `Successfully deleted memory vector ${memoryId} for user ${userId}`
    );
    return { success: true };
  } catch (error) {
    console.error("Failed to delete memory vector:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update memory vector access statistics
 * Called when a memory is used in AI response generation
 */
export async function updateMemoryAccess(
  userId: string,
  memoryId: string
): Promise<void> {
  try {
    // Update access count in PostgreSQL
    await db.memory.update({
      where: { id: memoryId },
      data: {
        accessCount: {
          increment: 1,
        },
        lastAccessed: new Date(),
      },
    });

    // Note: We don't update Pinecone metadata for access stats to avoid
    // unnecessary vector operations. The metadata in Pinecone remains static.
  } catch (error) {
    // This is not critical - just log the error
    console.warn("Failed to update memory access stats:", error);
  }
}

/**
 * Health check for Pinecone connection
 */
export async function checkPineconeHealth(): Promise<{
  available: boolean;
  error?: string;
  responseTime?: number;
}> {
  const startTime = Date.now();

  try {
    // Try to describe the index to test connection
    const stats = await pineconeIndex.describeIndexStats();
    const responseTime = Date.now() - startTime;

    return {
      available: true,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      available: false,
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check for duplicate memories using cosine similarity
 */
async function checkForDuplicateMemory(
  userId: string,
  embedding: number[]
): Promise<{
  isDuplicate: boolean;
  similarity?: number;
  existingMemoryId?: string;
}> {
  try {
    if (!pineconeIndex) {
      return { isDuplicate: false };
    }

    const userNamespace = getUserNamespace(userId);

    // Query for similar vectors with high similarity threshold
    const queryResponse = await pineconeIndex.namespace(userNamespace).query({
      vector: embedding,
      topK: 3, // Check top 3 most similar
      includeMetadata: true,
      includeValues: false,
    });

    // Check if any matches exceed our duplicate threshold (0.9)
    const duplicateThreshold = 0.9;

    for (const match of queryResponse.matches || []) {
      if (match.score && match.score >= duplicateThreshold) {
        return {
          isDuplicate: true,
          similarity: match.score,
          existingMemoryId: match.id,
        };
      }
    }

    return { isDuplicate: false };
  } catch (error) {
    console.warn("Error checking for duplicate memories:", error);
    // If we can't check for duplicates, don't block the operation
    return { isDuplicate: false };
  }
}

/**
 * Batch memory storage for improved performance
 */
export async function batchStoreMemories(
  userId: string,
  memories: Array<{
    memoryId: string;
    content: string;
    metadata: {
      type: string;
      importance: number;
      category: string;
      createdAt: string;
    };
  }>
): Promise<{
  success: boolean;
  stored: number;
  duplicates: number;
  errors: number;
}> {
  let stored = 0;
  let duplicates = 0;
  let errors = 0;

  // Process in batches of 10 to avoid overwhelming the API
  const batchSize = 10;

  for (let i = 0; i < memories.length; i += batchSize) {
    const batch = memories.slice(i, i + batchSize);

    // Process batch in parallel
    const results = await Promise.allSettled(
      batch.map((memory) =>
        storeMemoryVector(
          memory.memoryId,
          memory.memoryId,
          memory.content,
          memory.metadata
        )
      )
    );

    // Count results
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        if (result.value.success) {
          if (result.value.isDuplicate) {
            duplicates++;
          } else {
            stored++;
          }
        } else {
          errors++;
        }
      } else {
        errors++;
      }
    });

    // Small delay between batches to be respectful to the API
    if (i + batchSize < memories.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return {
    success: errors < memories.length / 2, // Success if less than half failed
    stored,
    duplicates,
    errors,
  };
}
