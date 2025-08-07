import { generateResponse } from "./grok";

export interface ExtractedMemory {
  content: string;
  type: string;
  importance: number; // 1-10 scale
  category: string;
  tags: string[];
  emotionalContext?: string;
}

/**
 * Extract memories from conversation with intelligent triggers and robust parsing
 * This function identifies personally meaningful information that would help
 * personalize future interactions and experiences
 */
export async function extractMemories(
  userMessage: string,
  aiResponse: string,
  conversationContext: Record<string, unknown>[]
): Promise<ExtractedMemory[]> {
  try {
    // Pre-filter to check if the conversation likely contains memorable content
    if (!shouldExtractMemories(userMessage, aiResponse)) {
      return [];
    }

    // Create enhanced extraction prompt with better structure
    const extractionPrompt = createMemoryExtractionPrompt(
      userMessage,
      aiResponse,
      conversationContext
    );

    // Generate response with retry logic
    const response = await generateMemoryResponse(extractionPrompt);

    // Parse with robust error handling
    const memories = parseMemoryResponse(response);

    // Validate and filter memories
    const validMemories = validateMemories(memories);

    console.log(
      `Extracted ${validMemories.length} valid memories from conversation`
    );
    return validMemories;
  } catch (error) {
    console.error("Memory extraction failed:", error);
    return [];
  }
}

/**
 * Intelligent pre-filtering to determine if conversation contains memorable content
 */
function shouldExtractMemories(
  userMessage: string,
  aiResponse: string
): boolean {
  const message = userMessage.toLowerCase();
  const response = aiResponse.toLowerCase();

  // Keywords that indicate potentially memorable content
  const memoryTriggers = [
    // Personal information
    "my name",
    "i am",
    "i'm",
    "call me",
    "my family",
    "my friend",
    "my job",
    "i work",
    "my favorite",
    "i love",
    "i hate",
    "i enjoy",
    "i prefer",
    "i like",
    "i dislike",
    "my birthday",
    "my age",

    // Experiences and events
    "yesterday",
    "today",
    "tomorrow",
    "last week",
    "next week",
    "happened",
    "experience",
    "remember when",
    "story",
    "tell you about",
    "something that",
    "went to",
    "visited",
    "traveled",
    "trip",

    // Emotions and feelings
    "feel",
    "feeling",
    "emotion",
    "happy",
    "sad",
    "excited",
    "worried",
    "anxious",
    "nervous",
    "confident",
    "scared",
    "angry",
    "frustrated",
    "disappointed",
    "proud",
    "grateful",
    "stressed",
    "relaxed",

    // Relationships
    "relationship",
    "partner",
    "boyfriend",
    "girlfriend",
    "spouse",
    "husband",
    "wife",
    "dating",
    "love",
    "crush",
    "friend",
    "family",

    // Goals and aspirations
    "want to",
    "hope to",
    "planning to",
    "goal",
    "dream",
    "aspire",
    "looking forward",
    "excited about",
    "working towards",

    // Personal traits and patterns
    "always",
    "never",
    "usually",
    "typically",
    "tend to",
    "habit",
    "personality",
    "character",
    "style",
    "approach",
    "way i",

    // Preferences and opinions
    "opinion",
    "believe",
    "think that",
    "philosophy",
    "value",
    "important to me",
    "matters to me",
    "care about",

    // Current state and context
    "right now",
    "currently",
    "at the moment",
    "lately",
    "recently",
    "these days",
    "situation",
    "dealing with",
    "going through",
  ];

  // Check if message contains memory triggers
  const hasMemoryTriggers = memoryTriggers.some(
    (trigger) => message.includes(trigger) || response.includes(trigger)
  );

  // Additional checks for meaningful content
  const isPersonalShare =
    message.includes("i ") ||
    message.includes("my ") ||
    message.includes("me ");
  const isSubstantialLength = userMessage.length > 20; // Filter out very short messages
  const isNotGeneric = !isGenericResponse(userMessage);

  return (
    hasMemoryTriggers && isPersonalShare && isSubstantialLength && isNotGeneric
  );
}

/**
 * Check if message is too generic to extract memories from
 */
function isGenericResponse(message: string): boolean {
  const genericPhrases = [
    "hi",
    "hello",
    "hey",
    "thanks",
    "thank you",
    "ok",
    "okay",
    "yes",
    "no",
    "sure",
    "alright",
    "bye",
    "goodbye",
    "lol",
    "haha",
    "hmm",
    "yeah",
    "sounds good",
    "i see",
    "makes sense",
    "got it",
    "understood",
  ];

  const normalizedMessage = message.toLowerCase().trim();
  return (
    genericPhrases.includes(normalizedMessage) || normalizedMessage.length < 10
  );
}

/**
 * Create enhanced extraction prompt with better structure and examples
 */
function createMemoryExtractionPrompt(
  userMessage: string,
  aiResponse: string,
  conversationContext: Record<string, unknown>[]
): string {
  return `You are an expert at identifying personally meaningful information that would help make future conversations more personal and relevant.

Analyze this conversation and extract ONLY truly meaningful memories about the user - information that would help me understand them better and provide more personalized responses in future conversations.

User Message: "${userMessage}"
AI Response: "${aiResponse}"
Recent Context: ${JSON.stringify(conversationContext.slice(-3))}

IMPORTANT GUIDELINES:
1. Only extract NEW information, not things already discussed
2. Focus on personal details that would make future conversations better
3. Avoid generic or obvious information
4. Prioritize emotional context, personal preferences, and unique experiences
5. Each memory should be specific and actionable for future personalization

Memory Types:
- PERSONALITY_TRAIT: Core personality characteristics
- PREFERENCE: Likes, dislikes, favorites
- LIFE_EVENT: Significant experiences or events
- RELATIONSHIP_DYNAMIC: Information about relationships
- EMOTIONAL_STATE: Current emotions or emotional patterns
- GOAL: Aspirations or objectives
- FEAR: Concerns or anxieties
- INTEREST: Hobbies or topics they enjoy
- BEHAVIORAL_PATTERN: How they typically act or respond

Categories: personality, preference, relationship, life_event, emotional, goal

Respond with VALID JSON only:
{
  "memories": [
    {
      "content": "Brief, specific description of what to remember",
      "type": "EXACT_TYPE_FROM_LIST_ABOVE",
      "importance": 1-10,
      "category": "one_of_the_categories_above",
      "tags": ["relevant", "searchable", "tags"],
      "emotionalContext": "optional emotional context when shared"
    }
  ]
}

If no meaningful memories should be extracted, respond with:
{"memories": []}`;
}

/**
 * Generate memory response with retry logic for better reliability
 */
async function generateMemoryResponse(
  prompt: string,
  maxRetries: number = 3
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await generateResponse(
        [
          { role: "system", content: prompt },
          { role: "user", content: "Extract memories from this conversation." },
        ],
        {
          temperature: 0.1, // Low temperature for consistency
          maxTokens: 800,
        }
      );

      if (!response || !response.content || response.content.trim() === "") {
        console.warn("Empty response from AI, returning empty memories");
        return '{"memories": []}';
      }

      // Basic validation that response looks like JSON
      const content = response.content.trim();
      if (!content.startsWith("{") || !content.endsWith("}")) {
        console.warn("Invalid JSON format from AI, attempting to fix...");
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return jsonMatch[0];
        }
        console.warn("Cannot extract valid JSON, returning empty memories");
        return '{"memories": []}';
      }

      return content;
    } catch (error) {
      console.warn(`Memory extraction attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        console.warn(
          "All memory extraction attempts failed, returning empty memories"
        );
        return '{"memories": []}';
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  return '{"memories": []}'; // Fallback return instead of throwing
}

/**
 * Parse memory response with robust error handling
 */
function parseMemoryResponse(responseContent: string): ExtractedMemory[] {
  try {
    // Clean the response content
    let cleanContent = responseContent.trim();

    // Remove any markdown code blocks
    cleanContent = cleanContent
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "");

    // Remove any leading/trailing text that's not JSON
    const jsonStart = cleanContent.indexOf("{");
    const jsonEnd = cleanContent.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      console.warn(
        "No valid JSON found in response:",
        responseContent.slice(0, 200)
      );
      return [];
    }

    cleanContent = cleanContent.slice(jsonStart, jsonEnd + 1);

    // Parse JSON
    const parsed = JSON.parse(cleanContent);

    // Validate structure
    if (!parsed || typeof parsed !== "object") {
      console.warn("Parsed content is not an object:", parsed);
      return [];
    }

    if (!Array.isArray(parsed.memories)) {
      console.warn("No memories array found in parsed content:", parsed);
      return [];
    }

    return parsed.memories;
  } catch (error) {
    console.error("Failed to parse memory response:", error);
    console.error("Response content:", responseContent.slice(0, 500));

    // Try to extract partial JSON or fallback parsing
    return tryFallbackParsing(responseContent);
  }
}

/**
 * Fallback parsing for malformed JSON responses
 */
function tryFallbackParsing(content: string): ExtractedMemory[] {
  try {
    // Try to find individual memory objects in the text
    const memoryMatches = content.match(/"content":\s*"[^"]+"/g);
    if (!memoryMatches || memoryMatches.length === 0) {
      return [];
    }

    console.warn("Using fallback parsing for malformed JSON");

    // Create simple memories from matched content
    const fallbackMemories: ExtractedMemory[] = [];

    for (const match of memoryMatches.slice(0, 3)) {
      // Limit to 3 for safety
      const contentMatch = match.match(/"content":\s*"([^"]+)"/);
      if (contentMatch && contentMatch[1]) {
        fallbackMemories.push({
          content: contentMatch[1],
          type: "PREFERENCE", // Default type
          importance: 5, // Default importance
          category: "general", // Default category
          tags: [],
          emotionalContext: undefined,
        });
      }
    }

    return fallbackMemories;
  } catch (error) {
    console.error("Fallback parsing also failed:", error);
    return [];
  }
}

/**
 * Validate and filter extracted memories
 */
function validateMemories(memories: unknown[]): ExtractedMemory[] {
  const validMemories: ExtractedMemory[] = [];

  const validTypes = [
    "PERSONALITY_TRAIT",
    "PREFERENCE",
    "LIFE_EVENT",
    "RELATIONSHIP_DYNAMIC",
    "EMOTIONAL_STATE",
    "GOAL",
    "FEAR",
    "INTEREST",
    "BEHAVIORAL_PATTERN",
  ];

  const validCategories = [
    "personality",
    "preference",
    "relationship",
    "life_event",
    "emotional",
    "goal",
  ];

  for (const memoryItem of memories) {
    try {
      // Type guard: ensure it's an object
      if (!memoryItem || typeof memoryItem !== "object") {
        console.warn("Memory item is not an object:", memoryItem);
        continue;
      }

      const memory = memoryItem as Record<string, unknown>;

      // Validate required fields
      if (
        !memory.content ||
        typeof memory.content !== "string" ||
        memory.content.trim().length < 10
      ) {
        console.warn("Invalid memory content:", memory.content);
        continue;
      }

      if (
        !memory.type ||
        typeof memory.type !== "string" ||
        !validTypes.includes(memory.type)
      ) {
        console.warn("Invalid memory type:", memory.type);
        continue;
      }

      if (
        !memory.category ||
        typeof memory.category !== "string" ||
        !validCategories.includes(memory.category)
      ) {
        console.warn("Invalid memory category:", memory.category);
        continue;
      }

      // Validate importance (1-10)
      const importance =
        typeof memory.importance === "number"
          ? memory.importance
          : typeof memory.importance === "string"
          ? parseInt(memory.importance)
          : 5;

      if (importance < 1 || importance > 10) {
        console.warn("Invalid importance score:", memory.importance);
        continue;
      }

      // Ensure tags is an array
      const tags = Array.isArray(memory.tags)
        ? (memory.tags.filter(
            (tag: unknown) => typeof tag === "string" && tag.length > 0
          ) as string[])
        : [];

      // Create valid memory object
      const validMemory: ExtractedMemory = {
        content: memory.content.trim(),
        type: memory.type,
        importance: Math.max(1, Math.min(10, importance)),
        category: memory.category,
        tags: tags.slice(0, 5), // Limit to 5 tags
        emotionalContext:
          memory.emotionalContext && typeof memory.emotionalContext === "string"
            ? memory.emotionalContext.trim()
            : undefined,
      };

      validMemories.push(validMemory);
    } catch (error) {
      console.warn("Failed to validate memory:", error, memoryItem);
    }
  }

  return validMemories;
}
