import { NextRequest, NextResponse } from "next/server";
import { generateResponse } from "@/lib/ai/grok";

export async function GET(req: NextRequest) {
  try {
    // Check API key
    const hasApiKey = !!process.env.XAI_API_KEY;

    if (!hasApiKey) {
      return NextResponse.json(
        {
          error: "XAI_API_KEY not configured",
          configured: false,
        },
        { status: 500 }
      );
    }

    // Test simple Grok call
    const testMessages = [
      {
        role: "system" as const,
        content:
          "You are a helpful assistant. Respond with exactly: 'Test successful'",
      },
      {
        role: "user" as const,
        content: "Please respond with the test message.",
      },
    ];

    console.log("Testing Grok API with simple request...");

    const result = await generateResponse(testMessages, {
      temperature: 0.1,
      maxTokens: 50,
    });

    return NextResponse.json({
      success: true,
      configured: true,
      response: {
        content: result.content,
        contentLength: result.content.length,
        usage: result.usage,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Grok debug test failed:", error);

    return NextResponse.json(
      {
        error: error.message,
        configured: !!process.env.XAI_API_KEY,
        timestamp: new Date().toISOString(),
        details: {
          name: error.name,
          stack: error.stack?.split("\n").slice(0, 5), // First 5 lines of stack
        },
      },
      { status: 500 }
    );
  }
}
