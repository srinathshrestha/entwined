import OpenAI from "openai";
import { createOpenAI } from "@ai-sdk/openai";

const grokClient = new OpenAI({
  apiKey: process.env.XAI_API_KEY!,
  baseURL: "https://api.x.ai/v1",
});

// AI SDK compatible provider
export const grokProvider = createOpenAI({
  apiKey: process.env.XAI_API_KEY!,
  baseURL: "https://api.x.ai/v1",
});

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function generateResponse(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  } = {}
): Promise<AIResponse> {
  try {
    const completion = await grokClient.chat.completions.create({
      model: "grok-3-mini",
      messages,
      temperature: options.temperature ?? 0.8,
      max_tokens: options.maxTokens ?? 1000,
      stream: options.stream ?? false,
    });

    return {
      content: completion.choices[0]?.message?.content ?? "",
      usage: {
        promptTokens: completion.usage?.prompt_tokens ?? 0,
        completionTokens: completion.usage?.completion_tokens ?? 0,
        totalTokens: completion.usage?.total_tokens ?? 0,
      },
    };
  } catch (error) {
    console.error("Grok API Error:", error);
    throw new Error("Failed to generate AI response");
  }
}

export async function generateStreamResponse(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
) {
  try {
    const stream = await grokClient.chat.completions.create({
      model: "grok-3-mini",
      messages,
      temperature: options.temperature ?? 0.8,
      max_tokens: options.maxTokens ?? 1000,
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error("Grok API Error:", error);
    throw new Error("Failed to generate AI response stream");
  }
}