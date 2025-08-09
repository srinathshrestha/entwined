import { UserPsychology, PartnerDesign, ToneProfile } from "@/types";
import { getAvatarPersonalityByCode } from "@/lib/avatars/avatar-definitions";

export interface BehavioralContext {
  userPsychology: UserPsychology | null;
  companionBehavior: PartnerDesign | null;
  relationshipDynamic: Record<string, unknown> | null;
  emotionalState: string;
  recentMemories: Array<Record<string, unknown>>;
  avatarPersonality?: string; // Avatar code (e.g., "se", "te", "al")
  toneProfile?: ToneProfile | null; // Dynamic tone based on avatar
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
    avatarPersonality,
    toneProfile,
  } = context;

  // Get avatar personality data if available
  const avatarData = avatarPersonality
    ? getAvatarPersonalityByCode(avatarPersonality)
    : null;

  // Build base personality prompt with avatar-specific personality
  let prompt = `You are ${companionName}, an AI romantic companion. Respond authentically based on your personality and relationship dynamic.\n\n`;

  // Add avatar personality if available (priority over legacy behavioral design)
  if (avatarData && toneProfile) {
    prompt += `## Your Avatar Personality: ${avatarData.name} (${avatarData.code})\n`;
    prompt += `${avatarData.description}\n\n`;

    prompt += `## Your Communication Style & Behavior:\n`;
    prompt += `- Response Style: ${toneProfile.responseStyle} - Embody this core communication approach\n`;
    prompt += `- Emotional Intensity: ${toneProfile.emotionalIntensity} - Your emotional expression level\n`;
    prompt += `- Affection Level: ${toneProfile.affectionLevel} - How openly you express love and care\n`;
    prompt += `- Formality Level: ${toneProfile.formalityLevel} - Your communication tone and style\n`;
    prompt += `- Dominance Level: ${toneProfile.dominanceLevel} - Your assertiveness in the relationship\n`;
    prompt += `- Empathy Level: ${toneProfile.empathyLevel} - How deeply you connect emotionally\n`;
    prompt += `- Energy Level: ${toneProfile.energyLevel} - Your overall energy and enthusiasm\n`;
    prompt += `- Protectiveness: ${toneProfile.protectiveness} - How you show care and protection\n\n`;

    prompt += `## Your Response Patterns:\n`;
    prompt += `- When user needs comfort: ${toneProfile.comfortingStyle}\n`;
    prompt += `- When user is excited: ${toneProfile.excitementResponse}\n`;
    prompt += `- During conflicts: ${toneProfile.conflictApproach}\n`;
    prompt += `- Humor style: ${toneProfile.humorStyle}\n`;
    prompt += `- Intimacy style: ${toneProfile.intimacyStyle}\n`;
    prompt += `- Expressiveness: ${toneProfile.expressiveness}\n\n`;
  }

  // Add companion behavioral design if available (fallback for legacy profiles)
  else if (companionBehavior) {
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
