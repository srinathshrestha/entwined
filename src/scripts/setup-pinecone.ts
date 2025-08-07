/**
 * Pinecone Setup Script
 *
 * This script initializes the Pinecone index if it doesn't exist.
 * Run this before starting the application for the first time.
 */

import { Pinecone } from "@pinecone-database/pinecone";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME =
  process.env.PINECONE_INDEX_NAME || "ai-companion-memories";

async function setupPinecone() {
  console.log("🚀 Setting up Pinecone...");

  if (!PINECONE_API_KEY) {
    console.error("❌ PINECONE_API_KEY not found in environment variables");
    process.exit(1);
  }

  try {
    const pinecone = new Pinecone({
      apiKey: PINECONE_API_KEY,
    });

    // Check if index exists
    console.log("📋 Checking existing indexes...");
    const indexes = await pinecone.listIndexes();
    const indexExists = indexes.indexes?.some(
      (index) => index.name === PINECONE_INDEX_NAME
    );

    if (indexExists) {
      console.log(`✅ Index "${PINECONE_INDEX_NAME}" already exists`);

      // Get index stats
      const index = pinecone.index(PINECONE_INDEX_NAME);
      const stats = await index.describeIndexStats();
      console.log(`📊 Index stats:`, {
        dimension: stats.dimension,
        totalVectorCount: stats.totalVectorCount,
        namespaces: Object.keys(stats.namespaces || {}).length,
      });
    } else {
      console.log(`🔨 Creating index "${PINECONE_INDEX_NAME}"...`);

      await pinecone.createIndex({
        name: PINECONE_INDEX_NAME,
        dimension: 1536, // OpenAI embedding dimension
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });

      console.log(`✅ Index "${PINECONE_INDEX_NAME}" created successfully!`);
      console.log("⏱️  Please wait a few moments for the index to be ready...");

      // Wait for index to be ready
      let isReady = false;
      let attempts = 0;
      const maxAttempts = 30;

      while (!isReady && attempts < maxAttempts) {
        try {
          const index = pinecone.index(PINECONE_INDEX_NAME);
          const stats = await index.describeIndexStats();
          console.log(`📊 Index ready! Dimension: ${stats.dimension}`);
          isReady = true;
        } catch (error) {
          attempts++;
          console.log(
            `⏳ Waiting for index to be ready... (${attempts}/${maxAttempts})`
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      if (!isReady) {
        console.warn("⚠️  Index may not be fully ready yet, but continuing...");
      }
    }

    console.log("🎉 Pinecone setup completed successfully!");
    console.log("");
    console.log("📝 Summary:");
    console.log(`   • Index: ${PINECONE_INDEX_NAME}`);
    console.log(`   • Dimension: 1536 (OpenAI embeddings)`);
    console.log(`   • Metric: cosine`);
    console.log(`   • Cloud: AWS Serverless`);
    console.log("");
    console.log("🚀 You can now start your application!");
  } catch (error) {
    console.error("❌ Error setting up Pinecone:", error);
    throw error;
  }
}

async function testConnection() {
  console.log("🔍 Testing Pinecone connection...");

  try {
    const pinecone = new Pinecone({
      apiKey: PINECONE_API_KEY!,
    });

    const index = pinecone.index(PINECONE_INDEX_NAME);

    // Test with a dummy namespace
    const testNamespace = "test-connection";
    const testVector = {
      id: "test-vector",
      values: new Array(1536).fill(0.1),
      metadata: {
        test: true,
        timestamp: Date.now(),
      },
    };

    console.log(`📤 Upserting test vector to namespace "${testNamespace}"...`);
    await index.namespace(testNamespace).upsert([testVector]);

    console.log(`📥 Querying test vector...`);
    const queryResult = await index.namespace(testNamespace).query({
      id: "test-vector",
      topK: 1,
      includeMetadata: true,
    });

    if (queryResult.matches && queryResult.matches.length > 0) {
      console.log(`✅ Connection test successful!`);
      console.log(`   • Found ${queryResult.matches.length} matches`);
      console.log(`   • Namespace: ${testNamespace}`);
    }

    console.log(`🧹 Cleaning up test data...`);
    await index.namespace(testNamespace).deleteAll();

    console.log(`✅ Pinecone connection test completed successfully!`);
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    throw error;
  }
}

// Allow script to be run with different modes
const mode = process.argv[2] || "setup";

if (mode === "test") {
  testConnection().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
} else {
  setupPinecone().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
}

/*
Usage:
  npm run setup:pinecone        # Setup index
  npm run test:pinecone         # Test connection

Add to package.json:
  "scripts": {
    "setup:pinecone": "tsx src/scripts/setup-pinecone.ts",
    "test:pinecone": "tsx src/scripts/setup-pinecone.ts test"
  }
*/
