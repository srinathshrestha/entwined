import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

/**
 * Generate embeddings using OpenAI's text-embedding-3-small model
 * This service includes robust error handling and retries
 */

export interface EmbeddingResult {
  embedding: number[];
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate a single embedding from text input
 * @param text - The text to embed
 * @param retries - Number of retry attempts (default: 3)
 * @returns Promise<EmbeddingResult>
 */
export async function generateEmbedding(
  text: string,
  retries: number = 3
): Promise<number[]> {
  // Validate input
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Input text cannot be empty");
  }

  // Clean and prepare text for embedding
  const cleanText = text
    .replace(/\n+/g, " ") // Replace multiple newlines with space
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim()
    .slice(0, 8000); // Limit to 8000 characters for safety

  if (cleanText.length === 0) {
    throw new Error("Text is empty after cleaning");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Use AI SDK's embed function with OpenAI
      const result = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: cleanText,
      });

      // Validate embedding result
      if (!result.embedding || !Array.isArray(result.embedding)) {
        throw new Error("Invalid embedding response format");
      }

      if (result.embedding.length === 0) {
        throw new Error("Empty embedding vector received");
      }

      return result.embedding;
    } catch (error) {
      console.warn(`Embedding generation attempt ${attempt} failed:`, error);

      if (attempt === retries) {
        // Last attempt failed - throw the error
        throw new Error(
          `Failed to generate embedding after ${retries} attempts: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }

      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error("Unexpected error in embedding generation");
}

/**
 * Generate embeddings for multiple texts in batch
 * @param texts - Array of texts to embed
 * @param batchSize - Size of each batch (default: 10)
 * @returns Promise<number[][]>
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  batchSize: number = 10
): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  const results: number[][] = [];

  // Process in batches to avoid rate limits
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    try {
      // Process batch in parallel but with controlled concurrency
      const batchPromises = batch.map((text, index) =>
        generateEmbedding(text).catch((error) => {
          console.error(`Failed to embed text ${i + index}:`, error);
          return null; // Return null for failed embeddings
        })
      );

      const batchResults = await Promise.all(batchPromises);

      // Filter out null results and add to main results
      for (const result of batchResults) {
        if (result !== null) {
          results.push(result);
        }
      }

      // Add delay between batches to respect rate limits
      if (i + batchSize < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to process batch starting at index ${i}:`, error);
      // Continue with next batch
    }
  }

  return results;
}

/**
 * Calculate cosine similarity between two embedding vectors
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns number - Similarity score between -1 and 1
 */
export function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);

  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}

/**
 * Test embedding generation with a simple phrase
 * Used for health checks and debugging
 */
export async function testEmbeddingGeneration(): Promise<boolean> {
  try {
    const testText = "This is a test message for embedding generation.";
    const embedding = await generateEmbedding(testText);

    return embedding.length > 0 && typeof embedding[0] === "number";
  } catch (error) {
    console.error("Embedding generation test failed:", error);
    return false;
  }
}
