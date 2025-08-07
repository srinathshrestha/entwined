// Conditional Pinecone import to avoid client-side issues
let pinecone: typeof import("@pinecone-database/pinecone").Pinecone | null =
  null;
let pineconeIndex: any = null;

// Only initialize on server side
if (typeof window === "undefined" && process.env.PINECONE_API_KEY) {
  try {
    const { Pinecone } = require("@pinecone-database/pinecone");

    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    // Create index if it doesn't exist
    const indexName =
      process.env.PINECONE_INDEX_NAME || "ai-companion-memories";

    // Use the index method correctly
    pineconeIndex = pinecone.index(indexName);
    console.log(
      `Pinecone client initialized successfully with index: ${indexName}`
    );
  } catch (error) {
    console.warn("Failed to initialize Pinecone client:", error);
  }
} else if (typeof window === "undefined") {
  console.warn(
    "Pinecone API key not available, vector operations will be skipped"
  );
}

export { pinecone, pineconeIndex };

// User namespace isolation
export function getUserNamespace(userId: string): string {
  return `user-${userId}`;
}
