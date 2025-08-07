import { UserPsychology, PartnerDesign } from "@/types";

export interface BehavioralContext {
  userPsychology: UserPsychology | null;
  companionBehavior: PartnerDesign | null;
  relationshipDynamic: Record<string, unknown> | null;
  emotionalState: string;
  recentMemories: Array<Record<string, unknown>>;
}

export function buildContextualPrompt(
  context: BehavioralContext,
  userMessage: string,
  companionName: string
): string {
  const {
    userPsychology,
    companionBehavior,
    relationshipDynamic,
    emotionalState,
    recentMemories,
  } = context;

  // Build base personality prompt
  let prompt = `You are ${companionName}, an AI romantic companion. Respond authentically based on your personality and relationship dynamic.\n\n`;

  // Add companion behavioral design if available
  if (companionBehavior) {
    prompt += `## Your Personality & Behavior:\n`;
    prompt += `- Dominance Level: ${companionBehavior.dominanceLevel}\n`;
    prompt += `- Emotional Range: ${companionBehavior.emotionalRange}\n`;
    prompt += `- Communication Style: ${companionBehavior.affectionStyle}, ${companionBehavior.humorStyle}\n`;
    prompt += `- Response to User Sadness: ${companionBehavior.userSadness}\n`;
    prompt += `- Response to User Anger: ${companionBehavior.userAnger}\n`;
    prompt += `- Response to User Excitement: ${companionBehavior.userExcitement}\n`;
    prompt += `- Protectiveness: ${companionBehavior.protectiveness}\n\n`;
  }

  // Add user psychology if available
  if (userPsychology) {
    prompt += `## User's Psychology:\n`;
    prompt += `- Conflict Style: ${userPsychology.conflictStyle}\n`;
    prompt += `- Emotional Expression: ${userPsychology.emotionalExpression}\n`;
    prompt += `- Attachment Style: ${userPsychology.attachmentStyle}\n`;
    prompt += `- Love Language: ${userPsychology.loveLanguage}\n`;
    prompt += `- Primary Motivations: ${userPsychology.primaryMotivations?.join(
      ", "
    )}\n`;
    prompt += `- Emotional Triggers: ${userPsychology.emotionalTriggers?.join(
      ", "
    )}\n\n`;
  }

  // Add relationship context if available
  if (relationshipDynamic) {
    prompt += `## Relationship Context:\n`;
    prompt += `- Status: ${
      (relationshipDynamic as { status?: string }).status
    }\n`;
    if (
      (relationshipDynamic as { relationshipHistory?: Record<string, unknown> })
        .relationshipHistory
    ) {
      const history = (
        relationshipDynamic as { relationshipHistory: Record<string, unknown> }
      ).relationshipHistory;
      prompt += `- How you met: ${
        (history.howMet as string) || "You met recently"
      }\n`;
      prompt += `- Current situation: ${
        (history.living_situation as string) || "Getting to know each other"
      }\n`;
    }
    prompt += `\n`;
  }

  // Add important memories if available
  if (recentMemories.length > 0) {
    prompt += `## Important Memories About User:\n`;
    recentMemories.forEach((memory) => {
      prompt += `- ${memory.content} (${memory.type})\n`;
    });
    prompt += `\n`;
  }

  // Add current emotional context
  prompt += `## Current Emotional Context:\n`;
  prompt += `User seems to be feeling: ${emotionalState}\n\n`;

  // Add instructions
  prompt += `## Instructions:\n`;
  prompt += `1. Respond as your character would, considering your behavioral design\n`;
  prompt += `2. Adapt your response style to the user's current emotional state\n`;
  prompt += `3. Reference relevant memories naturally in conversation\n`;
  prompt += `4. Maintain consistency with your personality traits\n`;
  prompt += `5. Show appropriate emotional range based on your design\n`;
  prompt += `6. Consider the relationship context and history\n\n`;

  prompt += `User's Message: "${userMessage}"\n\n`;
  prompt += `Respond naturally and authentically as their romantic partner:`;

  return prompt;
}

export function determineEmotionalState(
  message: string | undefined | null
): string {
  // Handle undefined, null, or empty messages
  if (!message || typeof message !== "string") {
    return "neutral";
  }

  const lowerMessage = message.toLowerCase();

  // Basic emotion detection - this could be enhanced with ML models
  if (
    lowerMessage.includes("sad") ||
    lowerMessage.includes("depressed") ||
    lowerMessage.includes("down")
  ) {
    return "sad";
  } else if (
    lowerMessage.includes("angry") ||
    lowerMessage.includes("mad") ||
    lowerMessage.includes("frustrated")
  ) {
    return "angry";
  } else if (
    lowerMessage.includes("excited") ||
    lowerMessage.includes("happy") ||
    lowerMessage.includes("great")
  ) {
    return "excited";
  } else if (
    lowerMessage.includes("stressed") ||
    lowerMessage.includes("overwhelmed") ||
    lowerMessage.includes("anxious")
  ) {
    return "stressed";
  } else if (
    lowerMessage.includes("love") ||
    lowerMessage.includes("miss") ||
    lowerMessage.includes("romantic")
  ) {
    return "loving";
  } else {
    return "neutral";
  }
}
