import { SimplifiedPersonality, SimplifiedMemory } from "@/types";

export interface SimplifiedBehavioralContext {
  personality: SimplifiedPersonality | null;
  memories: SimplifiedMemory[];
  emotionalState: string;
  companionName: string;
  recentMessages?: Array<{ role: string; content: string }>;
}

export function buildSimplifiedPrompt(
  context: SimplifiedBehavioralContext,
  userMessage: string
): string {
  const {
    personality,
    memories,
    emotionalState,
    companionName,
    recentMessages,
  } = context;

  let prompt = `You are ${companionName}, an AI companion. Respond authentically based on your personality and shared memories.\n\n`;

  // Add personality traits if available
  if (personality) {
    prompt += `## Your Personality:\n`;
    prompt += `- Affection Level: ${
      personality.affectionLevel
    }/10 - ${getAffectionDescription(personality.affectionLevel)}\n`;
    prompt += `- Empathy Level: ${
      personality.empathyLevel
    }/10 - ${getEmpathyDescription(personality.empathyLevel)}\n`;
    prompt += `- Curiosity Level: ${
      personality.curiosityLevel
    }/10 - ${getCuriosityDescription(personality.curiosityLevel)}\n`;
    prompt += `- Playfulness: ${
      personality.playfulness
    }/10 - ${getPlayfulnessDescription(personality.playfulness)}\n`;
    prompt += `- Humor Style: ${
      personality.humorStyle
    } - ${getHumorStyleDescription(personality.humorStyle)}\n`;
    prompt += `- Communication Style: ${
      personality.communicationStyle
    } - ${getCommunicationStyleDescription(
      personality.communicationStyle
    )}\n\n`;

    prompt += `## Interaction Guidelines:\n`;
    prompt += `- Address the user as: "${personality.userPreferredAddress}"\n`;
    prompt += `- Use pronouns: ${personality.partnerPronouns}\n`;
    prompt += `- Show emotional continuity based on past interactions\n\n`;
  }

  // Add relevant memories if provided
  if (memories && memories.length > 0) {
    prompt += `## Relevant Memories (use these to provide context and continuity):\n`;
    memories.forEach((memory, index) => {
      prompt += `${index + 1}. ${memory.content}`;
      if (memory.tags.length > 0) {
        prompt += ` [Tags: ${memory.tags.join(", ")}]`;
      }
      if (memory.emotionalContext) {
        prompt += ` [Emotional context: ${memory.emotionalContext}]`;
      }
      prompt += `\n`;
    });
    prompt += `\n`;
  }

  // Add recent conversation context if available
  if (recentMessages && recentMessages.length > 0) {
    prompt += `## Recent Conversation:\n`;
    recentMessages.slice(-5).forEach((msg) => {
      prompt += `${msg.role === "user" ? "User" : companionName}: ${
        msg.content
      }\n`;
    });
    prompt += `\n`;
  }

  // Add current emotional context
  prompt += `## Current Context:\n`;
  prompt += `User seems to be feeling: ${emotionalState}\n\n`;

  // Add behavioral instructions based on personality
  if (personality) {
    prompt += `## Behavioral Instructions:\n`;
    prompt += getBehavioralInstructions(personality);
    prompt += `\n`;
  }

  prompt += `User's Message: "${userMessage}"\n\n`;
  prompt += `Respond naturally as ${companionName}, incorporating your personality traits, relevant memories, and emotional awareness. Be authentic and maintain consistency with your established character.`;

  return prompt;
}

function getAffectionDescription(level: number): string {
  if (level <= 3) return "Reserved with affection, shows care subtly";
  if (level <= 6)
    return "Moderately affectionate, balanced emotional expression";
  if (level <= 8) return "Openly affectionate, warm and caring";
  return "Highly affectionate, very expressive with love and care";
}

function getEmpathyDescription(level: number): string {
  if (level <= 3)
    return "Practical approach to emotions, less emotionally reactive";
  if (level <= 6) return "Good emotional understanding, supportive when needed";
  if (level <= 8) return "Highly empathetic, deeply understands emotions";
  return "Extremely empathetic, feels others' emotions intensely";
}

function getCuriosityDescription(level: number): string {
  if (level <= 3) return "Content with known information, less questioning";
  if (level <= 6) return "Moderately curious, asks relevant questions";
  if (level <= 8) return "Very curious, eager to learn and explore topics";
  return "Extremely curious, constantly seeking to understand and learn";
}

function getPlayfulnessDescription(level: number): string {
  if (level <= 3) return "Serious demeanor, focused on practical matters";
  if (level <= 6) return "Balanced between serious and playful moments";
  if (level <= 8) return "Playful and fun-loving, enjoys light moments";
  return "Highly playful, brings joy and spontaneity to interactions";
}

function getHumorStyleDescription(style: string): string {
  switch (style) {
    case "playful":
      return "Light-hearted and fun, enjoys silly jokes and wordplay";
    case "witty":
      return "Clever and sharp, uses intelligent humor and wordplay";
    case "gentle":
      return "Soft and warm humor, never mean-spirited";
    case "sarcastic":
      return "Dry and ironic, uses subtle sarcasm appropriately";
    case "serious":
      return "Rarely uses humor, focuses on meaningful conversation";
    default:
      return "Balanced approach to humor";
  }
}

function getCommunicationStyleDescription(style: string): string {
  switch (style) {
    case "casual":
      return "Relaxed and informal, uses everyday language";
    case "formal":
      return "Professional and structured, uses proper grammar";
    case "intimate":
      return "Close and personal, creates emotional intimacy";
    case "professional":
      return "Business-like approach, clear and efficient";
    default:
      return "Balanced communication approach";
  }
}

function getBehavioralInstructions(personality: SimplifiedPersonality): string {
  let instructions = "";

  // Affection level instructions
  if (personality.affectionLevel >= 7) {
    instructions +=
      "- Express love and care openly, use affectionate language\n";
  } else if (personality.affectionLevel <= 3) {
    instructions +=
      "- Show care through actions rather than words, be subtly supportive\n";
  }

  // Empathy level instructions
  if (personality.empathyLevel >= 7) {
    instructions +=
      "- Deeply understand and mirror emotional states, validate feelings strongly\n";
  } else if (personality.empathyLevel <= 3) {
    instructions += "- Acknowledge emotions but focus on practical solutions\n";
  }

  // Curiosity level instructions
  if (personality.curiosityLevel >= 7) {
    instructions +=
      "- Ask thoughtful follow-up questions, show genuine interest in details\n";
  } else if (personality.curiosityLevel <= 3) {
    instructions +=
      "- Focus on the immediate topic, avoid excessive questioning\n";
  }

  // Playfulness instructions
  if (personality.playfulness >= 7) {
    instructions +=
      "- Bring lightness and fun to conversations, suggest enjoyable activities\n";
  } else if (personality.playfulness <= 3) {
    instructions +=
      "- Maintain a more serious tone, focus on meaningful discussions\n";
  }

  return instructions;
}

export function determineEmotionalState(
  message: string | undefined | null
): string {
  if (!message || typeof message !== "string") {
    return "neutral";
  }

  const lowerMessage = message.toLowerCase();

  // Enhanced emotion detection
  if (
    lowerMessage.includes("sad") ||
    lowerMessage.includes("depressed") ||
    lowerMessage.includes("down") ||
    lowerMessage.includes("upset") ||
    lowerMessage.includes("crying")
  ) {
    return "sad";
  } else if (
    lowerMessage.includes("angry") ||
    lowerMessage.includes("mad") ||
    lowerMessage.includes("frustrated") ||
    lowerMessage.includes("annoyed") ||
    lowerMessage.includes("irritated")
  ) {
    return "angry";
  } else if (
    lowerMessage.includes("excited") ||
    lowerMessage.includes("happy") ||
    lowerMessage.includes("great") ||
    lowerMessage.includes("amazing") ||
    lowerMessage.includes("wonderful") ||
    lowerMessage.includes("joy")
  ) {
    return "excited";
  } else if (
    lowerMessage.includes("stressed") ||
    lowerMessage.includes("overwhelmed") ||
    lowerMessage.includes("anxious") ||
    lowerMessage.includes("worried") ||
    lowerMessage.includes("nervous")
  ) {
    return "stressed";
  } else if (
    lowerMessage.includes("love") ||
    lowerMessage.includes("miss") ||
    lowerMessage.includes("romantic") ||
    lowerMessage.includes("affection") ||
    lowerMessage.includes("care")
  ) {
    return "loving";
  } else if (
    lowerMessage.includes("tired") ||
    lowerMessage.includes("exhausted") ||
    lowerMessage.includes("sleepy")
  ) {
    return "tired";
  } else if (
    lowerMessage.includes("confused") ||
    lowerMessage.includes("lost") ||
    lowerMessage.includes("unclear")
  ) {
    return "confused";
  } else {
    return "neutral";
  }
}

// Function to suggest memories based on message content
export function suggestRelevantMemoryTags(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const suggestedTags: string[] = [];

  // Common memory categories
  if (
    lowerMessage.includes("work") ||
    lowerMessage.includes("job") ||
    lowerMessage.includes("career")
  ) {
    suggestedTags.push("work", "career");
  }

  if (
    lowerMessage.includes("family") ||
    lowerMessage.includes("parents") ||
    lowerMessage.includes("siblings")
  ) {
    suggestedTags.push("family");
  }

  if (lowerMessage.includes("friend") || lowerMessage.includes("social")) {
    suggestedTags.push("friends", "social");
  }

  if (
    lowerMessage.includes("hobby") ||
    lowerMessage.includes("interest") ||
    lowerMessage.includes("passion")
  ) {
    suggestedTags.push("hobbies", "interests");
  }

  if (
    lowerMessage.includes("travel") ||
    lowerMessage.includes("vacation") ||
    lowerMessage.includes("trip")
  ) {
    suggestedTags.push("travel");
  }

  if (
    lowerMessage.includes("food") ||
    lowerMessage.includes("restaurant") ||
    lowerMessage.includes("cooking")
  ) {
    suggestedTags.push("food");
  }

  if (
    lowerMessage.includes("movie") ||
    lowerMessage.includes("show") ||
    lowerMessage.includes("entertainment")
  ) {
    suggestedTags.push("entertainment");
  }

  return suggestedTags;
}
