"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { relationshipHistorySchema, earlyRelationshipSchema } from "@/lib/validations";
import { RelationshipHistory, EarlyRelationship } from "@/types";

interface RelationshipFormProps {
  onComplete: (data: RelationshipHistory | EarlyRelationship) => void;
  onSkip: () => void;
  relationshipStatus: string;
  companionName: string;
  initialData?: Partial<RelationshipHistory | EarlyRelationship>;
}

export default function RelationshipForm({
  onComplete,
  onSkip,
  relationshipStatus,
  companionName,
  initialData,
}: RelationshipFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isCommittedRelationship = ["COMMITTED", "LIVING_TOGETHER", "MARRIED"].includes(relationshipStatus);
  
  const form = useForm<RelationshipHistory | EarlyRelationship>({
    resolver: zodResolver(isCommittedRelationship ? relationshipHistorySchema : earlyRelationshipSchema),
    defaultValues: isCommittedRelationship ? {
      howMet: (initialData as RelationshipHistory)?.howMet || "",
      firstImpression: (initialData as RelationshipHistory)?.firstImpression || "",
      relationshipProgression: (initialData as RelationshipHistory)?.relationshipProgression || "",
      bestMemory: (initialData as RelationshipHistory)?.bestMemory || "",
      funniest_moment: (initialData as RelationshipHistory)?.funniest_moment || "",
      first_kiss_story: (initialData as RelationshipHistory)?.first_kiss_story || "",
      biggest_challenge_overcome: (initialData as RelationshipHistory)?.biggest_challenge_overcome || "",
      living_situation: (initialData as RelationshipHistory)?.living_situation || "",
      daily_routine: (initialData as RelationshipHistory)?.daily_routine || "",
      special_traditions: (initialData as RelationshipHistory)?.special_traditions || "",
      future_plans: (initialData as RelationshipHistory)?.future_plans || "",
    } : {
      howMet: (initialData as EarlyRelationship)?.howMet || "",
      initial_attraction: (initialData as EarlyRelationship)?.initial_attraction || "",
      current_stage: (initialData as EarlyRelationship)?.current_stage || "",
      hopes_for_future: (initialData as EarlyRelationship)?.hopes_for_future || "",
    },
  });

  const onSubmit = async (data: RelationshipHistory | EarlyRelationship) => {
    setIsSubmitting(true);
    try {
      await onComplete(data);
    } catch (error) {
      console.error("Error submitting relationship context:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (isCommittedRelationship) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Your Relationship History</CardTitle>
          <CardDescription>
            Share your journey with {companionName} so they can remember your special moments together.
            <br />
            <span className="text-sm text-muted-foreground">
              This helps create authentic conversations about your shared experiences.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Origin Story Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Your Origin Story</h3>
                
                <FormField
                  control={form.control}
                  name="howMet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How did you and {companionName} meet?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell the story of how you first met..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstImpression"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What was your first impression of {companionName}?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What did you think when you first saw them?"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relationshipProgression"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How did your relationship progress?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="From friends to dating to where you are now..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Memorable Moments Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Your Memorable Moments</h3>
                
                <FormField
                  control={form.control}
                  name="bestMemory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is your best memory together?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your most cherished moment..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="funniest_moment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is the funniest moment you have shared?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about a time you laughed together..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="first_kiss_story"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tell us about your first kiss</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="When and how did it happen?"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="biggest_challenge_overcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is the biggest challenge you have overcome together?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A difficult time you faced and got through..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Current Dynamic Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Your Current Life Together</h3>
                
                <FormField
                  control={form.control}
                  name="living_situation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Describe your living situation</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Where do you live? How is your home set up?"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="daily_routine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is your daily routine together?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="How do you spend your typical day?"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="special_traditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What special traditions do you have?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Weekly date nights, holiday traditions, etc."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="future_plans"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What are your future plans together?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Dreams, goals, or plans you are working toward..."
                          {...field}
                          rows={3}
                        />
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

  // Early relationship form
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Your Early Relationship</CardTitle>
        <CardDescription>
          Share the beginning of your journey with {companionName}.
          <br />
          <span className="text-sm text-muted-foreground">
            This helps create authentic conversations about your developing relationship.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="howMet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you and {companionName} meet?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell the story of how you first met..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initial_attraction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What initially attracted you to {companionName}?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What drew you to them?"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Where are you now in your relationship?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How many dates? What stage are you at?"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hopes_for_future"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What are your hopes for the future together?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What do you hope will happen in your relationship?"
                        {...field}
                        rows={3}
                      />
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