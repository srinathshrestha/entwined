import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function setupPinecone() {
  try {
    console.log("Setting up Pinecone index...");

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const indexName = process.env.PINECONE_INDEX_NAME!;

    // Check if index already exists
    const indexes = await pinecone.listIndexes();
    const existingIndex = indexes.indexes?.find(
      (index) => index.name === indexName
    );

    if (existingIndex) {
      console.log(`Index "${indexName}" already exists.`);
      return;
    }

    // Create the index
    console.log(`Creating index "${indexName}"...`);
    
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536, // OpenAI text-embedding-3-small dimensions
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });

    console.log(`Index "${indexName}" created successfully!`);
    console.log("Waiting for index to be ready...");

    // Wait for index to be ready
    let indexReady = false;
    const maxWaitTime = 300000; // 5 minutes
    const startTime = Date.now();

    while (!indexReady && Date.now() - startTime < maxWaitTime) {
      try {
        const index = pinecone.index(indexName);
        const stats = await index.describeIndexStats();
        indexReady = true;
        console.log("Index is ready!");
        console.log("Index stats:", stats);
      } catch (error) {
        console.log("Index not ready yet, waiting...");
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      }
    }

    if (!indexReady) {
      console.error("Index failed to become ready within the timeout period.");
      process.exit(1);
    }

    console.log("Pinecone setup completed successfully!");
  } catch (error) {
    console.error("Error setting up Pinecone:", error);
    process.exit(1);
  }
}

// Run the setup
setupPinecone();