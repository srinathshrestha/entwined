import { pineconeIndex, getUserNamespace } from "./client";
import { generateEmbedding, calculateCosineSimilarity } from "../ai/embeddings";
import { db } from "../db";
import { updateMemoryAccess } from "./memory-storage";

export interface SearchedMemory {
  id: string;
  content: string;
  type: string;
  importance: number;
  category: string;
  score: number;
  createdAt: string;
  accessCount: number;
}

export interface SearchOptions {
  limit?: number;
  minImportance?: number;
  categories?: string[];
  minScore?: number;
  includeRecent?: boolean;
}

/**
 * Search for relevant memories using vector similarity with robust error handling
 * Includes fallback to PostgreSQL text search if Pinecone fails
 */
export async function searchRelevantMemories(
  userId: string,
  query: string,
  options: SearchOptions = {}
): Promise<SearchedMemory[]> {
  // Validate inputs
  if (
    !userId ||
    !query ||
    typeof query !== "string" ||
    query.trim().length === 0
  ) {
    console.warn("Invalid search parameters:", {
      userId,
      query: query?.slice(0, 50),
    });
    return [];
  }

  const {
    limit = 15, // Increased to 15 most relevant memories per response
    minImportance = 3,
    categories,
    minScore = 0.7, // Only fetch memories with >0.7 relevance score
    includeRecent = true,
  } = options;

  // First try Pinecone vector search
  try {
    const vectorResults = await searchWithPinecone(userId, query, {
      limit: Math.min(limit * 2, 20), // Get more results to filter
      minImportance,
      categories,
      minScore,
    });

    if (vectorResults.length > 0) {
      // Update access stats for retrieved memories (background task)
      updateMemoryAccessStats(vectorResults);

      // Return top results
      return vectorResults.slice(0, limit);
    }
  } catch (error) {
    console.warn("Pinecone search failed, falling back to PostgreSQL:", error);
  }

  // Fallback to PostgreSQL text search
  try {
    const fallbackResults = await searchWithPostgreSQL(userId, query, {
      limit,
      minImportance,
      categories,
      includeRecent,
    });

    console.log(
      `Using PostgreSQL fallback search, found ${fallbackResults.length} results`
    );
    return fallbackResults;
  } catch (error) {
    console.error("Both Pinecone and PostgreSQL search failed:", error);
    return [];
  }
}

/**
 * Search memories using Pinecone vector similarity
 */
async function searchWithPinecone(
  userId: string,
  query: string,
  options: {
    limit: number;
    minImportance: number;
    categories?: string[];
    minScore: number;
  }
): Promise<SearchedMemory[]> {
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  if (!queryEmbedding || queryEmbedding.length === 0) {
    throw new Error("Failed to generate query embedding");
  }

  // Build filter for Pinecone query
  const filter: Record<string, unknown> = {
    userId: { $eq: userId },
  };

  if (options.minImportance > 0) {
    filter.importance = { $gte: options.minImportance };
  }

  if (options.categories && options.categories.length > 0) {
    filter.category = { $in: options.categories };
  }

  // Query Pinecone
  const searchResult = await pineconeIndex
    .namespace(getUserNamespace(userId))
    .query({
      vector: queryEmbedding,
      topK: options.limit,
      includeMetadata: true,
      filter,
    });

  if (!searchResult.matches) {
    return [];
  }

  // Process and filter results
  const results: SearchedMemory[] = [];

  for (const match of searchResult.matches) {
    const score = match.score ?? 0;

    // Skip results below minimum score threshold
    if (score < options.minScore) {
      continue;
    }

    const metadata = match.metadata;
    if (!metadata) {
      continue;
    }

    results.push({
      id: match.id,
      content: metadata.content as string,
      type: metadata.type as string,
      importance: metadata.importance as number,
      category: metadata.category as string,
      score,
      createdAt: metadata.createdAt as string,
      accessCount: (metadata.accessCount as number) || 0,
    });
  }

  // Sort by relevance score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Fallback search using PostgreSQL full-text search
 */
async function searchWithPostgreSQL(
  userId: string,
  query: string,
  options: {
    limit: number;
    minImportance: number;
    categories?: string[];
    includeRecent: boolean;
  }
): Promise<SearchedMemory[]> {
  // Build where conditions
  const whereConditions: Record<string, unknown> = {
    userId,
    isVisible: true,
    importance: {
      gte: options.minImportance,
    },
  };

  if (options.categories && options.categories.length > 0) {
    whereConditions.category = {
      in: options.categories,
    };
  }

  // Prepare search terms for PostgreSQL
  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 2)
    .slice(0, 5); // Limit search terms

  if (searchTerms.length === 0) {
    // If no valid search terms, return recent memories
    return await getRecentMemories(userId, options);
  }

  // Search in content, summary (if exists), and tags
  const orConditions = searchTerms.flatMap((term) => [
    { content: { contains: term, mode: "insensitive" as const } },
    { summary: { contains: term, mode: "insensitive" as const } },
    { tags: { has: term } },
    { category: { contains: term, mode: "insensitive" as const } },
    { emotionalContext: { contains: term, mode: "insensitive" as const } },
  ]);

  whereConditions.OR = orConditions;

  // Query database
  const memories = await db.memory.findMany({
    where: whereConditions,
    orderBy: [
      { importance: "desc" },
      { lastAccessed: "desc" },
      { createdAt: "desc" },
    ],
    take: options.limit,
  });

  // Convert to SearchedMemory format
  return memories.map((memory) => ({
    id: memory.id,
    content: memory.content,
    type: memory.type,
    importance: memory.importance,
    category: memory.category || "general",
    score: 0.5, // Default score for text search
    createdAt: memory.createdAt.toISOString(),
    accessCount: memory.accessCount,
  }));
}

/**
 * Get recent memories when search fails
 */
async function getRecentMemories(
  userId: string,
  options: {
    limit: number;
    minImportance: number;
    categories?: string[];
  }
): Promise<SearchedMemory[]> {
  const whereConditions: Record<string, unknown> = {
    userId,
    isVisible: true,
    importance: {
      gte: Math.max(options.minImportance, 5), // Higher threshold for recent memories
    },
  };

  if (options.categories && options.categories.length > 0) {
    whereConditions.category = {
      in: options.categories,
    };
  }

  const memories = await db.memory.findMany({
    where: whereConditions,
    orderBy: [{ importance: "desc" }, { createdAt: "desc" }],
    take: Math.min(options.limit, 5), // Limit recent memories
  });

  return memories.map((memory) => ({
    id: memory.id,
    content: memory.content,
    type: memory.type,
    importance: memory.importance,
    category: memory.category || "general",
    score: 0.3, // Low score for recent memories
    createdAt: memory.createdAt.toISOString(),
    accessCount: memory.accessCount,
  }));
}

/**
 * Update access statistics for retrieved memories
 * Runs in background to avoid slowing down search
 */
function updateMemoryAccessStats(memories: SearchedMemory[]): void {
  // Run asynchronously without awaiting
  Promise.all(
    memories.map((memory) =>
      updateMemoryAccess(memory.id, memory.id).catch((error) =>
        console.warn(
          `Failed to update access stats for memory ${memory.id}:`,
          error
        )
      )
    )
  ).catch((error) => {
    console.warn("Failed to update some memory access stats:", error);
  });
}

/**
 * Search memories by specific categories
 */
export async function searchMemoriesByCategory(
  userId: string,
  category: string,
  limit: number = 10
): Promise<SearchedMemory[]> {
  try {
    const memories = await db.memory.findMany({
      where: {
        userId,
        category,
        isVisible: true,
      },
      orderBy: [
        { importance: "desc" },
        { lastAccessed: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    return memories.map((memory) => ({
      id: memory.id,
      content: memory.content,
      type: memory.type,
      importance: memory.importance,
      category: memory.category || "general",
      score: 1.0, // Max score for exact category match
      createdAt: memory.createdAt.toISOString(),
      accessCount: memory.accessCount,
    }));
  } catch (error) {
    console.error("Failed to search memories by category:", error);
    return [];
  }
}

/**
 * Get memory statistics for user
 */
export async function getMemoryStats(userId: string): Promise<{
  total: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  averageImportance: number;
}> {
  try {
    const memories = await db.memory.findMany({
      where: {
        userId,
        isVisible: true,
      },
      select: {
        category: true,
        type: true,
        importance: true,
      },
    });

    const stats = {
      total: memories.length,
      byCategory: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      averageImportance: 0,
    };

    let totalImportance = 0;

    for (const memory of memories) {
      // Count by category
      const category = memory.category || "general";
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Count by type
      stats.byType[memory.type] = (stats.byType[memory.type] || 0) + 1;

      // Sum importance
      totalImportance += memory.importance;
    }

    // Calculate average importance
    stats.averageImportance =
      memories.length > 0
        ? Math.round((totalImportance / memories.length) * 10) / 10
        : 0;

    return stats;
  } catch (error) {
    console.error("Failed to get memory stats:", error);
    return {
      total: 0,
      byCategory: {},
      byType: {},
      averageImportance: 0,
    };
  }
}

/**
 * Pre-fetch user's top 50 memories for chat session
 * This optimizes performance by loading frequently accessed memories
 */
export async function prefetchUserMemories(
  userId: string
): Promise<SearchedMemory[]> {
  try {
    console.log("Pre-fetching top memories for user:", userId);

    // Get top 50 memories by importance and recent access
    const memories = await db.memory.findMany({
      where: {
        userId,
        isVisible: true, // Only visible memories
        importance: { gte: 5 }, // Only high-importance memories
      },
      orderBy: [
        { importance: "desc" },
        { accessCount: "desc" },
        { createdAt: "desc" },
      ],
      take: 50,
    });

    // Format for consistent interface
    const formattedMemories: SearchedMemory[] = memories.map((memory) => ({
      id: memory.id,
      content: memory.content,
      type: memory.type,
      importance: memory.importance,
      category: memory.category || "general",
      score: 1.0, // Perfect score for pre-fetched memories
      createdAt: memory.createdAt.toISOString(),
      accessCount: memory.accessCount || 0,
    }));

    console.log(
      `Pre-fetched ${formattedMemories.length} high-importance memories`
    );
    return formattedMemories;
  } catch (error) {
    console.error("Error pre-fetching memories:", error);
    return [];
  }
}

/**
 * Cache for frequently accessed memories (24hr TTL)
 * In production, you'd use Redis or similar for this
 */
const memoryCache = new Map<
  string,
  {
    memories: SearchedMemory[];
    timestamp: number;
    ttl: number;
  }
>();

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached memories for a user
 */
export function getCachedMemories(userId: string): SearchedMemory[] | null {
  const cached = memoryCache.get(userId);
  if (!cached) return null;

  // Check if cache is still valid
  if (Date.now() - cached.timestamp > cached.ttl) {
    memoryCache.delete(userId);
    return null;
  }

  return cached.memories;
}

/**
 * Cache memories for a user
 */
export function setCachedMemories(
  userId: string,
  memories: SearchedMemory[]
): void {
  memoryCache.set(userId, {
    memories,
    timestamp: Date.now(),
    ttl: CACHE_TTL,
  });
}

/**
 * Clear cache for a user (call when memories are updated)
 */
export function clearUserMemoryCache(userId: string): void {
  memoryCache.delete(userId);
}

/**
 * Optimized memory search with caching and parallel processing
 */
export async function searchMemoriesOptimized(
  userId: string,
  query: string,
  options: SearchOptions = {}
): Promise<SearchedMemory[]> {
  // Check cache first
  let cachedMemories = getCachedMemories(userId);

  // Start vector search in parallel with cache check
  const vectorSearchPromise = searchRelevantMemories(userId, query, {
    ...options,
    limit: 15, // Get top 15 most relevant
    minScore: 0.7, // Only >0.7 relevance
  });

  // If no cache, pre-fetch in parallel
  if (!cachedMemories) {
    const prefetchPromise = prefetchUserMemories(userId);

    // Wait for both operations
    const [vectorResults, prefetchedMemories] = await Promise.all([
      vectorSearchPromise,
      prefetchPromise,
    ]);

    // Cache the pre-fetched memories
    setCachedMemories(userId, prefetchedMemories);

    return vectorResults;
  }

  // If we have cache, just wait for vector search
  return await vectorSearchPromise;
}
