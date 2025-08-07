import {
  User,
  Companion,
  RelationshipDynamic,
  Conversation,
  Message,
  Memory,
  UserPreferences,
  MessageRole,
  MemoryType,
  RelationshipStatus,
  DeletedBy,
} from "@prisma/client";

// =============================================================================
// BASIC PROFILE TYPES (ONBOARDING STEP 1)
// =============================================================================

export interface BasicUserProfile {
  name: string;
  age: number;
  location: string;
  occupation: string;
}

export interface BasicCompanionProfile {
  name: string;
  gender: "male" | "female" | "non-binary";
  age: number;
  location: string;
  occupation: string;
  avatar?: string; // Selected from gender-based options
}

export interface BasicRelationshipInfo {
  status: RelationshipStatus;
}

// =============================================================================
// PSYCHOLOGICAL PROFILING TYPES (ONBOARDING STEP 2)
// =============================================================================

export interface UserPsychology {
  // Core Behavioral Patterns
  conflictStyle:
    | "avoids_conflict"
    | "direct_confrontation"
    | "passive_aggressive"
    | "seeks_compromise";
  emotionalExpression:
    | "highly_expressive"
    | "reserved"
    | "selective_sharing"
    | "emotional_walls";
  decisionMaking:
    | "impulsive"
    | "analytical"
    | "seeks_validation"
    | "independent";
  stressResponse:
    | "withdraws"
    | "seeks_comfort"
    | "becomes_irritable"
    | "overthinks";

  // Relationship Dynamics
  attachmentStyle: "secure" | "anxious" | "avoidant" | "disorganized";
  loveLanguage:
    | "words_of_affirmation"
    | "physical_touch"
    | "quality_time"
    | "acts_of_service"
    | "gifts";
  vulnerabilityComfort:
    | "very_open"
    | "selective"
    | "guarded"
    | "extremely_private";

  // Power Dynamics
  authorityResponse:
    | "respects_authority"
    | "questions_authority"
    | "rebels_against_authority";
  leadership:
    | "natural_leader"
    | "prefers_following"
    | "situational_leader"
    | "avoids_responsibility";

  // Motivations & Triggers
  primaryMotivations: string[]; // ["achievement", "security", "connection", "freedom", "recognition"]
  emotionalTriggers: string[]; // ["feeling_ignored", "being_criticized", "uncertainty", "pressure"]
  comfortSources: string[]; // ["physical_affection", "verbal_reassurance", "alone_time", "problem_solving"]
}

export interface PartnerDesign {
  // Core Personality Framework
  dominanceLevel:
    | "highly_dominant"
    | "assertive"
    | "balanced"
    | "submissive"
    | "highly_submissive";
  emotionalRange:
    | "very_expressive"
    | "moderately_expressive"
    | "controlled"
    | "stoic";
  adaptability:
    | "highly_adaptive"
    | "somewhat_flexible"
    | "consistent"
    | "rigid";

  // Response Patterns to User Behaviors
  userMisbehavior:
    | "authoritative_correction"
    | "gentle_guidance"
    | "playful_teasing"
    | "ignores_it";
  userSadness:
    | "immediate_comfort"
    | "problem_solving"
    | "distraction"
    | "gives_space";
  userAnger: "calming_presence" | "matches_energy" | "defensive" | "withdraws";
  userExcitement:
    | "matches_enthusiasm"
    | "gentle_grounding"
    | "supportive_observer";

  // Communication Patterns
  conflictApproach:
    | "direct_discussion"
    | "emotional_appeal"
    | "logical_reasoning"
    | "avoids_conflict";
  affectionStyle:
    | "very_physical"
    | "verbally_loving"
    | "acts_of_service"
    | "quality_time";
  humorStyle:
    | "playful_teasing"
    | "witty_banter"
    | "gentle_humor"
    | "serious_nature";

  // Relationship Role
  protectiveness:
    | "highly_protective"
    | "supportive"
    | "encouraging_independence";
  initiative: "takes_charge" | "collaborative" | "follows_user_lead";
  jealousyLevel:
    | "very_jealous"
    | "mildly_jealous"
    | "secure"
    | "encourages_friendships";
}

// =============================================================================
// RELATIONSHIP CONTEXT TYPES (ONBOARDING STEP 3)
// =============================================================================

export interface RelationshipHistory {
  // Origin Story
  howMet: string; // Free text: "We met at a coffee shop..."
  firstImpression: string; // "I thought they were mysterious and intriguing..."
  relationshipProgression: string; // "We started as friends, then..."

  // Memorable Moments
  bestMemory: string;
  funniest_moment: string;
  first_kiss_story: string;
  biggest_challenge_overcome: string;

  // Current Dynamic
  living_situation: string; // "We live together in a small apartment..."
  daily_routine: string; // "They make coffee, I make breakfast..."
  special_traditions: string; // "Every Friday we watch movies together..."
  future_plans: string; // "We're planning to travel to Japan next year..."
}

export interface EarlyRelationship {
  howMet: string;
  initial_attraction: string;
  current_stage: string; // "We've been on three dates..."
  hopes_for_future: string;
}

// =============================================================================
// CONTENT BOUNDARIES (ONBOARDING STEP 4)
// =============================================================================

export interface ContentBoundaries {
  topicsToAvoid: string[];
  comfortLevels: {
    matureContent: "strict" | "moderate" | "open";
    conversationDepth: "surface" | "moderate" | "deep";
  };
  hardBoundaries: string[];
  triggerWarnings: string[];
}

// =============================================================================
// ONBOARDING FORM TYPES
// =============================================================================

export interface OnboardingStep1Data {
  user: BasicUserProfile;
  companion: BasicCompanionProfile;
  relationship: BasicRelationshipInfo;
}

export interface OnboardingStep2Data {
  user: UserPsychology;
  companion: PartnerDesign;
}

export interface OnboardingStep3Data {
  relationship: RelationshipHistory | EarlyRelationship;
}

export interface OnboardingStep4Data {
  contentBoundaries: ContentBoundaries;
}

// =============================================================================
// CHAT TYPES
// =============================================================================

export interface ChatMessage extends Message {
  conversation: Conversation;
  replyTo?: Message;
  replies?: Message[];
}

export interface MessageWithContext {
  message: Message;
  relatedMemories: Memory[];
  conversationContext: Message[];
}

// =============================================================================
// MEMORY TYPES
// =============================================================================

export interface MemoryWithMetadata extends Memory {
  sourceMessage?: Message;
  relatedConversation?: Conversation;
}

export interface MemoryCreationRequest {
  content: string;
  type: MemoryType;
  importance: number;
  sourceMessageId?: string;
  category?: string;
  tags?: string[];
}

export interface MemorySearchResult {
  memory: Memory;
  similarity: number;
  relevanceScore: number;
}

// =============================================================================
// CONTEXT ASSEMBLY TYPES
// =============================================================================

export interface StaticContext {
  userProfile: User;
  companionProfile: Companion;
  relationshipDynamic: RelationshipDynamic;
}

export interface DynamicContext {
  recentMessages: Message[];
  relevantMemories: MemorySearchResult[];
  currentMood?: string;
  timeContext: {
    time: string;
    day: string;
    season: string;
  };
  conversationTone: string;
}

export interface CharacterFilter {
  personality: string[];
  communicationStyle: string;
  relationshipRole: string;
  contentBoundaries: ContentBoundaries;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface OnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  isComplete: boolean;
  nextStep?: number;
}

// =============================================================================
// EXPORT PRISMA TYPES
// =============================================================================

export type {
  User,
  Companion,
  RelationshipDynamic,
  Conversation,
  Message,
  Memory,
  UserPreferences,
  MessageRole,
  MemoryType,
  RelationshipStatus,
  DeletedBy,
};

// =============================================================================
// OPTION CONSTANTS
// =============================================================================

export const MOTIVATIONS = [
  "achievement",
  "security",
  "connection",
  "freedom",
  "recognition",
  "knowledge",
  "creativity",
  "helping_others",
] as const;

export const EMOTIONAL_TRIGGERS = [
  "feeling_ignored",
  "being_criticized",
  "uncertainty",
  "pressure",
  "feeling_controlled",
  "conflict",
  "rejection",
  "feeling_inadequate",
] as const;

export const COMFORT_SOURCES = [
  "physical_affection",
  "verbal_reassurance",
  "alone_time",
  "problem_solving",
  "distraction",
  "talking_through_feelings",
  "physical_activity",
  "creative_expression",
] as const;
