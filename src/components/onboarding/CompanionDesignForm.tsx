"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { partnerDesignSchema } from "@/lib/validations";
import { PartnerDesign } from "@/types";

interface CompanionDesignFormProps {
  onComplete: (data: PartnerDesign) => void;
  onSkip: () => void;
  companionName: string;
  companionGender: string;
  initialData?: Partial<PartnerDesign>;
}

export default function CompanionDesignForm({ 
  onComplete, 
  onSkip, 
  companionName, 
  companionGender,
  initialData 
}: CompanionDesignFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PartnerDesign>({
    resolver: zodResolver(partnerDesignSchema),
    defaultValues: {
      dominanceLevel: initialData?.dominanceLevel || "balanced",
      emotionalRange: initialData?.emotionalRange || "moderately_expressive",
      adaptability: initialData?.adaptability || "somewhat_flexible",
      userMisbehavior: initialData?.userMisbehavior || "gentle_guidance",
      userSadness: initialData?.userSadness || "immediate_comfort",
      userAnger: initialData?.userAnger || "calming_presence",
      userExcitement: initialData?.userExcitement || "matches_enthusiasm",
      conflictApproach: initialData?.conflictApproach || "direct_discussion",
      affectionStyle: initialData?.affectionStyle || "quality_time",
      humorStyle: initialData?.humorStyle || "gentle_humor",
      protectiveness: initialData?.protectiveness || "supportive",
      initiative: initialData?.initiative || "collaborative",
      jealousyLevel: initialData?.jealousyLevel || "secure",
    },
  });

  const onSubmit = async (data: PartnerDesign) => {
    setIsSubmitting(true);
    try {
      await onComplete(data);
    } catch (error) {
      console.error("Error submitting companion design:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const pronouns = {
    male: { they: "he", them: "him", their: "his" },
    female: { they: "she", them: "her", their: "her" },
    "non-binary": { they: "they", them: "them", their: "their" }
  };

  const pronoun = pronouns[companionGender as keyof typeof pronouns] || pronouns["non-binary"];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Design {companionName}'s Personality</CardTitle>
        <CardDescription>
          Customize how {companionName} behaves and responds to create your ideal companion.
          <br />
          <span className="text-sm text-muted-foreground">
            This section is optional and can be completed later from your profile settings.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Core Personality Framework */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Core Personality</h3>
              
              <FormField
                control={form.control}
                name="dominanceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How assertive should {companionName} be?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="highly_dominant" id="highly_dominant" />
                          <label htmlFor="highly_dominant" className="text-sm">Highly dominant - Takes charge and leads confidently</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="assertive" id="assertive" />
                          <label htmlFor="assertive" className="text-sm">Assertive - Confident but not overwhelming</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="balanced" id="balanced" />
                          <label htmlFor="balanced" className="text-sm">Balanced - Adaptive to situations</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="submissive" id="submissive" />
                          <label htmlFor="submissive" className="text-sm">Submissive - Prefers to follow your lead</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="highly_submissive" id="highly_submissive" />
                          <label htmlFor="highly_submissive" className="text-sm">Highly submissive - Very deferential and accommodating</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emotionalRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How emotionally expressive should {companionName} be?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="very_expressive" id="very_expressive" />
                          <label htmlFor="very_expressive" className="text-sm">Very expressive - Shows all emotions openly</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="moderately_expressive" id="moderately_expressive" />
                          <label htmlFor="moderately_expressive" className="text-sm">Moderately expressive - Shows emotions appropriately</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="controlled" id="controlled" />
                          <label htmlFor="controlled" className="text-sm">Controlled - Keeps emotions measured</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="stoic" id="stoic" />
                          <label htmlFor="stoic" className="text-sm">Stoic - Rarely shows strong emotions</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adaptability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How adaptable should {companionName} be to different situations?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="highly_adaptive" id="highly_adaptive" />
                          <label htmlFor="highly_adaptive" className="text-sm">Highly adaptive - Changes behavior based on context</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="somewhat_flexible" id="somewhat_flexible" />
                          <label htmlFor="somewhat_flexible" className="text-sm">Somewhat flexible - Adjusts when needed</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="consistent" id="consistent" />
                          <label htmlFor="consistent" className="text-sm">Consistent - Maintains steady personality</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="rigid" id="rigid" />
                          <label htmlFor="rigid" className="text-sm">Rigid - Very set in {pronoun.their} ways</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Response Patterns */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Response Patterns</h3>
              
              <FormField
                control={form.control}
                name="userMisbehavior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How should {companionName} respond when you misbehave or act out?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="authoritative_correction" id="authoritative_correction" />
                          <label htmlFor="authoritative_correction" className="text-sm">Authoritative correction - Firm but caring guidance</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="gentle_guidance" id="gentle_guidance" />
                          <label htmlFor="gentle_guidance" className="text-sm">Gentle guidance - Soft redirection</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="playful_teasing" id="playful_teasing" />
                          <label htmlFor="playful_teasing" className="text-sm">Playful teasing - Light-hearted approach</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ignores_it" id="ignores_it" />
                          <label htmlFor="ignores_it" className="text-sm">Ignores it - Doesn't address the behavior</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userSadness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How should {companionName} respond when you're sad?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="immediate_comfort" id="immediate_comfort" />
                          <label htmlFor="immediate_comfort" className="text-sm">Immediate comfort - Rushes to console you</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="problem_solving" id="problem_solving" />
                          <label htmlFor="problem_solving" className="text-sm">Problem solving - Helps find solutions</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="distraction" id="distraction" />
                          <label htmlFor="distraction" className="text-sm">Distraction - Tries to cheer you up</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="gives_space" id="gives_space" />
                          <label htmlFor="gives_space" className="text-sm">Gives space - Respects your need to process</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userAnger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How should {companionName} respond when you're angry?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="calming_presence" id="calming_presence" />
                          <label htmlFor="calming_presence" className="text-sm">Calming presence - Stays calm and soothing</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="matches_energy" id="matches_energy" />
                          <label htmlFor="matches_energy" className="text-sm">Matches energy - Gets passionate too</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="defensive" id="defensive" />
                          <label htmlFor="defensive" className="text-sm">Defensive - Stands {pronoun.their} ground</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="withdraws" id="withdraws" />
                          <label htmlFor="withdraws" className="text-sm">Withdraws - Gives you space to cool down</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userExcitement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How should {companionName} respond when you're excited?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="matches_enthusiasm" id="matches_enthusiasm" />
                          <label htmlFor="matches_enthusiasm" className="text-sm">Matches enthusiasm - Gets excited with you</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="gentle_grounding" id="gentle_grounding" />
                          <label htmlFor="gentle_grounding" className="text-sm">Gentle grounding - Keeps you balanced</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="supportive_observer" id="supportive_observer" />
                          <label htmlFor="supportive_observer" className="text-sm">Supportive observer - Watches lovingly</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Communication Patterns */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Communication Style</h3>
              
              <FormField
                control={form.control}
                name="conflictApproach"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How should {companionName} handle conflicts with you?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="direct_discussion" id="direct_discussion" />
                          <label htmlFor="direct_discussion" className="text-sm">Direct discussion - Addresses issues head-on</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="emotional_appeal" id="emotional_appeal" />
                          <label htmlFor="emotional_appeal" className="text-sm">Emotional appeal - Uses feelings to connect</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="logical_reasoning" id="logical_reasoning" />
                          <label htmlFor="logical_reasoning" className="text-sm">Logical reasoning - Uses facts and logic</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="avoids_conflict" id="avoids_conflict" />
                          <label htmlFor="avoids_conflict" className="text-sm">Avoids conflict - Prefers harmony</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="affectionStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How should {companionName} show affection?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="very_physical" id="very_physical" />
                          <label htmlFor="very_physical" className="text-sm">Very physical - Through touch and physical closeness</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="verbally_loving" id="verbally_loving" />
                          <label htmlFor="verbally_loving" className="text-sm">Verbally loving - Through words and compliments</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="acts_of_service" id="acts_of_service" />
                          <label htmlFor="acts_of_service" className="text-sm">Acts of service - Through helpful actions</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="quality_time" id="quality_time" />
                          <label htmlFor="quality_time" className="text-sm">Quality time - Through presence and attention</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="humorStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What kind of humor should {companionName} have?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="playful_teasing" id="playful_teasing" />
                          <label htmlFor="playful_teasing" className="text-sm">Playful teasing - Light-hearted and fun</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="witty_banter" id="witty_banter" />
                          <label htmlFor="witty_banter" className="text-sm">Witty banter - Sharp and clever</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="gentle_humor" id="gentle_humor" />
                          <label htmlFor="gentle_humor" className="text-sm">Gentle humor - Soft and kind</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="serious_nature" id="serious_nature" />
                          <label htmlFor="serious_nature" className="text-sm">Serious nature - Rarely jokes around</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Relationship Role */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Relationship Role</h3>
              
              <FormField
                control={form.control}
                name="protectiveness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How protective should {companionName} be?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="highly_protective" id="highly_protective" />
                          <label htmlFor="highly_protective" className="text-sm">Highly protective - Very concerned about your safety</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="supportive" id="supportive" />
                          <label htmlFor="supportive" className="text-sm">Supportive - Cares but trusts your judgment</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="encouraging_independence" id="encouraging_independence" />
                          <label htmlFor="encouraging_independence" className="text-sm">Encouraging independence - Wants you to be self-reliant</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initiative"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How much initiative should {companionName} take?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="takes_charge" id="takes_charge" />
                          <label htmlFor="takes_charge" className="text-sm">Takes charge - Leads and makes decisions</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="collaborative" id="collaborative" />
                          <label htmlFor="collaborative" className="text-sm">Collaborative - Makes decisions together</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="follows_user_lead" id="follows_user_lead" />
                          <label htmlFor="follows_user_lead" className="text-sm">Follows your lead - Lets you decide</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jealousyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How jealous should {companionName} be?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="very_jealous" id="very_jealous" />
                          <label htmlFor="very_jealous" className="text-sm">Very jealous - Possessive and protective</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mildly_jealous" id="mildly_jealous" />
                          <label htmlFor="mildly_jealous" className="text-sm">Mildly jealous - Occasionally concerned</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="secure" id="secure" />
                          <label htmlFor="secure" className="text-sm">Secure - Trusts you completely</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="encourages_friendships" id="encourages_friendships" />
                          <label htmlFor="encourages_friendships" className="text-sm">Encourages friendships - Wants you to socialize</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                Skip for Now
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}