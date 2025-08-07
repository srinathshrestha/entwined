// Conditional Pinecone import to avoid client-side issues
let pineconeIndex: any = null;

// Only initialize on server side
if (typeof window === "undefined" && process.env.PINECONE_API_KEY) {
  try {
    const { Pinecone } = require("@pinecone-database/pinecone");

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME!);
    console.log("Pinecone client initialized successfully");
  } catch (error) {
    console.warn("Failed to initialize Pinecone client:", error);
  }
} else if (typeof window === "undefined") {
  console.warn(
    "Pinecone API key not available, vector operations will be skipped"
  );
}

export { pineconeIndex };

// User namespace isolation
export function getUserNamespace(userId: string): string {
  return `user-${userId}`;
}
