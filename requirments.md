# Requirements - Entwined AI Romantic Companion App

## Executive Summary

Entwined is a personalized AI romantic companion app that creates intimate, continuous conversations through advanced memory systems and character consistency. Users create detailed psychological profiles for themselves and their AI partner, then engage in natural chat conversations with full memory continuity and modern chat features.

---

## User Stories

### **Authentication & Onboarding**

**US-001: Quick Registration**

- **As a** new user
- **I want to** sign up quickly with Google OAuth or username/password
- **So that** I can start using the app immediately
- **Acceptance Criteria:**
  - Sign up with Google OAuth in 1 click
  - username/password registration available
  - Redirect to onboarding after registration

**US-002: Basic Profile Setup**

- **As a** new user
- **I want to** provide basic information about myself and my desired AI partner
- **So that** I can start chatting with a personalized companion
- **Acceptance Criteria:**
  - Enter user details: name, age, location, occupation
  - Define partner: name, gender, age, location, occupation
  - Select relationship status from predefined options
  - Choose partner avatar from gender-based options
  - All fields required for chat access

**US-003: Psychological Profiling (Optional)**

- **As a** user who wants deeper personalization
- **I want to** provide detailed psychological and behavioral information
- **So that** my AI companion responds authentically to my personality
- **Acceptance Criteria:**
  - Skip option clearly visible and functional
  - Behavioral pattern questions (conflict style, emotional expression, decision making, stress response)
  - Relationship dynamics (attachment style, love language, vulnerability comfort)
  - Power dynamics (authority response, leadership preferences)
  - Motivations, triggers, and comfort sources selection
  - Form saves partial progress
  - Can complete later from profile section

**US-004: Partner Behavioral Design (Optional)**

- **As a** user creating my AI companion
- **I want to** design their behavioral patterns and emotional responses
- **So that** they interact with me in my preferred way
- **Acceptance Criteria:**
  - Dominance level and emotional range settings
  - Response patterns to user behaviors (misbehavior, sadness, anger, excitement)
  - Communication patterns (conflict approach, affection style, humor style)
  - Relationship role preferences (protectiveness, initiative, jealousy level)
  - Preview of how choices affect AI behavior

**US-005: Relationship Context Setup (Conditional)**

- **As a** user in a committed relationship status
- **I want to** provide our relationship history and dynamics
- **So that** the AI remembers our shared background
- **Acceptance Criteria:**
  - Only shown for committed/living together/married status
  - Origin story questions (how we met, first impressions, relationship progression)
  - Memorable moments (best memory, funniest moment, first kiss, challenges overcome)
  - Current dynamics (living situation, daily routine, traditions, future plans)
  - Early relationship users get simplified questions (how met, attraction, current stage, hopes)

### **Chat & Conversation**

**US-006: Natural Conversation**

- **As a** user
- **I want to** chat with my AI companion in a modern messaging interface
- **So that** it feels like talking to a real romantic partner
- **Acceptance Criteria:**
  - WhatsApp-style chat interface
  - Real-time message delivery
  - Typing indicators when AI is responding
  - Message timestamps
  - Partner name and avatar in header
  - Smooth animations and transitions

**US-007: Reply to Messages**

- **As a** user
- **I want to** reply to specific messages in our conversation
- **So that** I can reference earlier topics or clarify context
- **Acceptance Criteria:**
  - Click/tap any message to reply
  - Visual thread indicators showing reply chain
  - AI understands reply context in responses
  - Reply references shown in message thread
  - Clear visual distinction for reply messages

**US-008: Edit Message with Branching**

- **As a** user
- **I want to** edit my previous messages and see how conversation would change
- **So that** I can explore different conversation paths
- **Acceptance Criteria:**
  - Edit any of my previous messages (not AI messages)
  - AI generates new response to edited context
  - Visual indicators for conversation branches
  - Can switch between conversation branches
  - Edit history preserved
  - Branch indicators clearly visible

**US-009: Message Management**

- **As a** user
- **I want to** manage my conversation history
- **So that** I can control my chat data and privacy
- **Acceptance Criteria:**
  - Delete individual messages
  - Clear messages by date range
  - Clear entire conversation
  - Confirm dialogs for destructive actions
  - Option to keep or delete associated memories
  - Messages remain visible during deletion confirmation

**US-010: Conversation Continuity**

- **As a** user
- **I want to** have the AI remember our previous conversations
- **So that** it feels like an ongoing relationship
- **Acceptance Criteria:**
  - AI references past conversations naturally
  - Remembers user preferences and personality traits
  - Maintains relationship context across sessions
  - Consistent character personality based on behavioral design
  - Memory-informed responses that feel personal

### **Memory System**

**US-011: Automatic Memory Creation**

- **As a** user chatting with my AI companion
- **I want to** have important information automatically remembered
- **So that** I don't have to repeat myself
- **Acceptance Criteria:**
  - AI extracts memories from natural conversation automatically
  - Memories independent of chat message deletion
  - Importance scoring for different types of information (1-10 scale)
  - Categories: personality traits, preferences, experiences, life events, plans
  - No manual memory creation required during chat
  - Memory creation happens seamlessly in background

**US-012: Memory Independence**

- **As a** user managing my data
- **I want to** delete chat messages without affecting memories
- **So that** I can clean up conversations while keeping important context
- **Acceptance Criteria:**
  - Deleting messages doesn't delete memories
  - Deleting memories doesn't affect chat history
  - AI always has access to all stored memories
  - Clear separation between chat and memory management
  - User controls both independently through different UI sections

### **Profile Management**

**US-013: Profile Editing**

- **As a** user
- **I want to** edit my character profiles after creation
- **So that** I can refine my companion over time
- **Acceptance Criteria:**
  - Edit user psychological profile
  - Edit companion behavioral design
  - Edit relationship context and history
  - Change companion avatar
  - Changes reflected in future conversations immediately
  - Form validation prevents invalid combinations

**US-014: Memory Management**

- **As a** user
- **I want to** view and manage my AI companion's memories
- **So that** I can control what it remembers about me
- **Acceptance Criteria:**
  - View all memories organized by category and importance
  - See memory importance scores (1-10)
  - Search memories by content, type, or keywords
  - Delete individual memories
  - Export memory data for personal records
  - Memory creation dates and context visible
  - Confirmation dialogs for memory deletion

**US-015: Profile Completion**

- **As a** user who skipped detailed onboarding
- **I want to** complete my profiles when ready
- **So that** I can get richer conversations over time
- **Acceptance Criteria:**
  - Profile completion progress indicators
  - Access to all skipped onboarding sections
  - Guided completion with explanations and examples
  - Optional vs required sections clearly marked
  - Can save partial progress and return later

---

## User Flow

### **New User Journey**

```
Landing Page → Sign Up/In → Basic Details → Optional Psychology Forms → Avatar Selection → Chat
```

### **Detailed User Flow**

#### **1. Authentication Flow**

```
Landing Page
├── Sign In (existing users) → Dashboard
└── Sign Up (new users)
    ├── Google OAuth → Basic Details
    └── Email/Password → Email Verification → Basic Details
```

#### **2. Onboarding Flow**

```
Step 1: Basic Details (Required)
├── User Info: name, age, location, occupation
├── Partner Info: name, gender, age, location, occupation
├── Relationship Status: just_met | early_dating | committed | living_together | married
└── Continue to Psychology or Skip

↓

Step 2: User Psychology (Skippable)
├── Behavioral Patterns: conflict style, emotional expression, decision making, stress response
├── Relationship Dynamics: attachment style, love language, vulnerability comfort
├── Power Dynamics: authority response, leadership preferences
└── Motivations & Triggers: primary motivations, emotional triggers, comfort sources

↓

Step 3: Partner Behavioral Design (Skippable)
├── Core Personality: dominance level, emotional range, adaptability
├── Response Patterns: userMisbehavior, userSadness, userAnger, userExcitement
├── Communication: conflict approach, affection style, humor style
└── Relationship Role: protectiveness, initiative, jealousy level

↓

Step 4: Relationship Context (Conditional on Status)
├── If Committed/Living Together/Married:
│   ├── Origin Story: how met, first impression, progression
│   ├── Memorable Moments: best memory, funniest, first kiss, challenges
│   └── Current Dynamic: living situation, routine, traditions, future plans
└── If Just Met/Early Dating:
    ├── How Met: meeting story
    ├── Initial Attraction: what drew you
    ├── Current Stage: where you are now
    └── Hopes for Future: relationship aspirations

↓

Step 5: Avatar Selection
├── Gender-based options (male, female, non-binary)
├── Style categories (casual, professional, artistic)
└── 6-10 options per category

↓

Chat Interface
```

#### **3. Chat Flow**

```
Chat Interface
├── Send Message → AI Processing → Memory Extraction → AI Response
├── Reply to Message → Contextual AI Response with thread awareness
├── Edit Message → Conversation Branching → New AI Response path
└── Manage Messages → Delete/Clear (with memory preservation options)
```

#### **4. Profile Management Flow**

```
Profile Section
├── Edit User Profile → Update psychology/behavioral patterns
├── Edit Companion → Update behavioral design/avatar
├── Edit Relationship → Update context/history
└── Memory Management → View/Search/Delete memories
```

### **Returning User Flow**

```
Sign In → Dashboard → Continue Conversation OR Profile Management
```

---

## Core Features (MVP)

### **Phase 1: Essential Features**

#### **Authentication System**

- [x] Clerk integration with Google OAuth
- [x] Email/password registration
- [x] Session management
- [ ] User profile initialization

#### **Onboarding System**

- [x] Basic details form
- [ ] **Psychological profiling forms (4 steps with conditional logic)**
- [ ] **Partner behavioral design interface**
- [ ] **Conditional relationship history forms**
- [ ] **Avatar selection system with categories**
- [ ] **Progress tracking and skip options**

#### **Chat Interface**

- [x] Basic messaging interface
- [ ] **Reply to specific messages with threading**
- [ ] **Message editing with conversation branching**
- [ ] **Message deletion and bulk clearing**
- [ ] **Typing indicators and real-time updates**
- [ ] **Message timestamps and delivery status**

#### **AI Integration**

- [ ] **Grok-3-mini response generation**
- [ ] **Behavioral framework implementation**
- [ ] **Emotional response matrix**
- [ ] **Context assembly from profiles + memories**
- [ ] **Memory extraction triggers**

#### **Memory System**

- [ ] **Automatic memory extraction from conversations**
- [ ] **Pinecone vector storage with user namespaces**
- [ ] **Memory independence from chat messages**
- [ ] **Semantic memory retrieval for AI context**
- [ ] **Memory importance scoring (1-10)**

#### **Profile Management**

- [ ] **Profile editing interface for all sections**
- [ ] **Memory management UI with search and filters**
- [ ] **Avatar changing functionality**
- [ ] **Relationship context editing**

---

## Onboarding Form Design

### **Step 1: Basic Details (Required)**

```typescript
interface BasicDetails {
  user: {
    name: string;
    age: number;
    location: string;
    occupation: string;
  };
  partner: {
    name: string;
    gender: "male" | "female" | "non-binary";
    age: number;
    location: string;
    occupation: string;
    avatar?: string; // Selected from gender-based options
  };
  relationshipStatus:
    | "just_met"
    | "early_dating"
    | "committed"
    | "living_together"
    | "married";
}
```

### **Step 2: User Psychology (Detailed - Skippable)**

```typescript
interface UserPsychology {
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
```

### **Step 3: Partner Behavioral Design (Detailed - Skippable)**

```typescript
interface PartnerDesign {
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
```

### **Step 4: Relationship Context (Conditional)**

**For Committed/Living Together/Married:**

```typescript
interface RelationshipHistory {
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
```

**For Just Met/Early Dating:**

```typescript
interface EarlyRelationship {
  howMet: string;
  initial_attraction: string;
  current_stage: string; // "We've been on three dates..."
  hopes_for_future: string;
}
```

---

## Memory System Features

### **Memory Creation Triggers**

The AI agent creates memories when it detects:

1. **New Information Discovery**: First-time mentions of preferences, traits, or facts
2. **Emotional Significance**: Strong emotional expressions or reactions
3. **Behavioral Patterns**: Recurring behaviors or responses across conversations
4. **Relationship Development**: New shared experiences or relationship milestones
5. **Preference Changes**: Updates to previously known preferences or opinions
6. **Future Planning**: Mentions of goals, plans, or aspirations
7. **Important Life Events**: Significant personal or professional developments

### **Memory Types & Examples**

```typescript
enum MemoryType {
  // User's inherent characteristics
  PERSONALITY_TRAIT = "User gets anxious in social situations",
  BEHAVIORAL_PATTERN = "User always makes jokes when nervous",
  EMOTIONAL_TRIGGER = "User becomes withdrawn when criticized",

  // User's preferences and likes
  PREFERENCE = "User loves horror movies but hates jumpscares",
  INTEREST = "User is passionate about photography",
  DISLIKE = "User can't stand the smell of fish",

  // Relationship-specific information
  RELATIONSHIP_DYNAMIC = "User likes to be the one planning dates",
  SHARED_EXPERIENCE = "We had a picnic in Central Park last weekend",
  INTIMATE_MOMENT = "User felt vulnerable sharing their family story",
  CONFLICT_RESOLUTION = "User prefers to talk through problems immediately",

  // Life context and background
  LIFE_EVENT = "User graduated from medical school last year",
  FAMILY_INFO = "User's parents divorced when they were 12",
  CAREER_INFO = "User is considering a job change to marketing",

  // Future-oriented information
  GOAL = "User wants to learn Spanish by next summer",
  FEAR = "User is worried about meeting my parents",
  DREAM = "User dreams of traveling through Southeast Asia",
}
```

### **Memory Independence Principles**

- **Chat Deletion**: Deleting messages does NOT delete associated memories
- **Memory Deletion**: Deleting memories does NOT affect chat history
- **Agent Access**: AI agent always has access to all stored memories regardless of chat history
- **User Control**: Users manage chat and memories separately in different UI sections

---

## Acceptance Criteria

### **Performance Requirements**

- Chat response time: < 5 seconds
- Memory retrieval: < 1 second
- Page load time: < 3 seconds
- Real-time features: < 500ms latency
- Onboarding form submission: < 2 seconds

### **Quality Requirements**

- Character consistency: 90%+ user satisfaction
- Memory relevance: 85%+ useful memory retrieval
- Conversation continuity: Natural flow across sessions
- Error rate: < 2% of interactions
- Onboarding completion rate: > 70% for basic details

### **User Experience Requirements**

- Mobile responsive on all screen sizes
- Clear navigation between chat and profile sections
- Intuitive memory management interface
- Smooth animations and transitions
- Clear visual feedback for all user actions

### **Functional Requirements**

- All user data isolated per account
- Independent chat and memory deletion
- Profile changes reflected in AI behavior immediately
- Memory search and categorization working accurately
- Avatar selection and display functioning properly
- Conversation branching working seamlessly

---

## Content Boundaries & Safety

### **Content Guidelines**

- User-defined content boundaries respected
- Grok-3-mini enables mature/explicit content handling with lower restrictions
- Optional content filtering settings
- Clear consent and age verification (18+)

### **Privacy & Data Protection**

- User memories kept private and isolated
- No cross-user data contamination
- GDPR-compliant data deletion
- User control over all personal data
- Memory isolation per user (Pinecone namespaces)

---

## Success Metrics (MVP)

### **Engagement Metrics**

- Daily active users
- Average session duration (target: 15+ minutes)
- Messages per session (target: 20+)
- User retention rate (target: 60% weekly)

### **Feature Adoption**

- Reply feature usage rate (target: 40% of messages)
- Message editing feature usage (target: 10% of messages)
- Memory management engagement (target: 60% of users visit memory section)
- Profile completion rates (target: 50% complete psychology section)

### **Quality Metrics**

- User satisfaction with AI responses (target: 85%+)
- Memory accuracy and relevance (target: 80%+)
- Character consistency ratings (target: 90%+)
- Conversation flow satisfaction (target: 85%+)

### **Technical Metrics**

- Response time performance (target: < 5 seconds)
- Memory retrieval accuracy (target: 90%+)
- System uptime (target: 99%+)
- Error rates and user issue reports (target: < 2%)

---

## Future Enhancements (Post-MVP)

### **Advanced Chat Features**

- Voice messages and audio responses
- Image sharing and generation
- Conversation themes and moods
- Multiple conversation threads

### **Enhanced Memory System**

- Manual memory creation and editing by user
- Memory importance adjustment by user
- Memory categories and custom tagging
- Memory timeline visualization

### **Relationship Features**

- Relationship milestone tracking
- Anniversary reminders
- Shared goal planning and tracking
- Relationship growth metrics and insights

### **Personalization**

- Custom avatar creation/upload
- Personality trait fine-tuning based on interactions
- Communication style adaptation over time
- Advanced learning of user preferences and patterns
