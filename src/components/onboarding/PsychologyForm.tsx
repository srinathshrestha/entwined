"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { userPsychologySchema } from "@/lib/validations";
import { UserPsychology } from "@/types";
import { MOTIVATIONS, EMOTIONAL_TRIGGERS, COMFORT_SOURCES } from "@/types";

interface PsychologyFormProps {
  onComplete: (data: UserPsychology) => void;
  onSkip: () => void;
  initialData?: Partial<UserPsychology>;
}

export default function PsychologyForm({ onComplete, onSkip, initialData }: PsychologyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<UserPsychology>({
    resolver: zodResolver(userPsychologySchema),
    defaultValues: {
      conflictStyle: initialData?.conflictStyle || "seeks_compromise",
      emotionalExpression: initialData?.emotionalExpression || "selective_sharing",
      decisionMaking: initialData?.decisionMaking || "analytical",
      stressResponse: initialData?.stressResponse || "seeks_comfort",
      attachmentStyle: initialData?.attachmentStyle || "secure",
      loveLanguage: initialData?.loveLanguage || "quality_time",
      vulnerabilityComfort: initialData?.vulnerabilityComfort || "selective",
      authorityResponse: initialData?.authorityResponse || "respects_authority",
      leadership: initialData?.leadership || "situational_leader",
      primaryMotivations: initialData?.primaryMotivations || [],
      emotionalTriggers: initialData?.emotionalTriggers || [],
      comfortSources: initialData?.comfortSources || [],
    },
  });

  const onSubmit = async (data: UserPsychology) => {
    setIsSubmitting(true);
    try {
      await onComplete(data);
    } catch (error) {
      console.error("Error submitting psychology profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Psychology Profile</CardTitle>
        <CardDescription>
          Help us understand your personality and behavioral patterns for more authentic interactions.
          <br />
          <span className="text-sm text-muted-foreground">
            This section is optional and can be completed later from your profile settings.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Behavioral Patterns Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Behavioral Patterns</h3>
              
              <FormField
                control={form.control}
                name="conflictStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How do you typically handle conflicts?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="avoids_conflict" id="avoids_conflict" />
                          <label htmlFor="avoids_conflict" className="text-sm">I avoid conflicts and prefer to keep the peace</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="direct_confrontation" id="direct_confrontation" />
                          <label htmlFor="direct_confrontation" className="text-sm">I address conflicts directly and immediately</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="passive_aggressive" id="passive_aggressive" />
                          <label htmlFor="passive_aggressive" className="text-sm">I tend to be passive-aggressive when upset</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="seeks_compromise" id="seeks_compromise" />
                          <label htmlFor="seeks_compromise" className="text-sm">I look for compromises and middle ground</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emotionalExpression"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How do you express your emotions?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="highly_expressive" id="highly_expressive" />
                          <label htmlFor="highly_expressive" className="text-sm">I'm very open and expressive with my emotions</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="reserved" id="reserved" />
                          <label htmlFor="reserved" className="text-sm">I'm generally reserved and private</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="selective_sharing" id="selective_sharing" />
                          <label htmlFor="selective_sharing" className="text-sm">I share emotions selectively with close people</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="emotional_walls" id="emotional_walls" />
                          <label htmlFor="emotional_walls" className="text-sm">I have emotional walls and find it hard to open up</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="decisionMaking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How do you make important decisions?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="impulsive" id="impulsive" />
                          <label htmlFor="impulsive" className="text-sm">I make decisions quickly based on gut feelings</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="analytical" id="analytical" />
                          <label htmlFor="analytical" className="text-sm">I analyze all options thoroughly before deciding</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="seeks_validation" id="seeks_validation" />
                          <label htmlFor="seeks_validation" className="text-sm">I seek input and validation from others</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="independent" id="independent" />
                          <label htmlFor="independent" className="text-sm">I prefer making decisions independently</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stressResponse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How do you respond to stress?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="withdraws" id="withdraws" />
                          <label htmlFor="withdraws" className="text-sm">I withdraw and need alone time</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="seeks_comfort" id="seeks_comfort" />
                          <label htmlFor="seeks_comfort" className="text-sm">I seek comfort and support from others</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="becomes_irritable" id="becomes_irritable" />
                          <label htmlFor="becomes_irritable" className="text-sm">I become more irritable and reactive</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="overthinks" id="overthinks" />
                          <label htmlFor="overthinks" className="text-sm">I overthink and analyze everything</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Relationship Dynamics Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Relationship Dynamics</h3>
              
              <FormField
                control={form.control}
                name="attachmentStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What's your attachment style in relationships?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="secure" id="secure" />
                          <label htmlFor="secure" className="text-sm">Secure - I'm comfortable with intimacy and independence</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="anxious" id="anxious" />
                          <label htmlFor="anxious" className="text-sm">Anxious - I crave closeness but worry about abandonment</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="avoidant" id="avoidant" />
                          <label htmlFor="avoidant" className="text-sm">Avoidant - I value independence over closeness</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="disorganized" id="disorganized" />
                          <label htmlFor="disorganized" className="text-sm">Disorganized - I have mixed feelings about closeness</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loveLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What's your primary love language?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="words_of_affirmation" id="words_of_affirmation" />
                          <label htmlFor="words_of_affirmation" className="text-sm">Words of Affirmation - I love hearing loving words</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="physical_touch" id="physical_touch" />
                          <label htmlFor="physical_touch" className="text-sm">Physical Touch - I express love through touch</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="quality_time" id="quality_time" />
                          <label htmlFor="quality_time" className="text-sm">Quality Time - I value undivided attention</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="acts_of_service" id="acts_of_service" />
                          <label htmlFor="acts_of_service" className="text-sm">Acts of Service - I appreciate helpful actions</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="gifts" id="gifts" />
                          <label htmlFor="gifts" className="text-sm">Gifts - I love thoughtful gestures and presents</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vulnerabilityComfort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How comfortable are you with vulnerability?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="very_open" id="very_open" />
                          <label htmlFor="very_open" className="text-sm">Very open - I share easily and deeply</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="selective" id="selective" />
                          <label htmlFor="selective" className="text-sm">Selective - I open up to people I trust</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="guarded" id="guarded" />
                          <label htmlFor="guarded" className="text-sm">Guarded - I'm cautious about sharing personal things</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="extremely_private" id="extremely_private" />
                          <label htmlFor="extremely_private" className="text-sm">Extremely private - I rarely share personal details</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Power Dynamics Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Power Dynamics</h3>
              
              <FormField
                control={form.control}
                name="authorityResponse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How do you respond to authority figures?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="respects_authority" id="respects_authority" />
                          <label htmlFor="respects_authority" className="text-sm">I generally respect and follow authority</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="questions_authority" id="questions_authority" />
                          <label htmlFor="questions_authority" className="text-sm">I question authority and need explanations</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="rebels_against_authority" id="rebels_against_authority" />
                          <label htmlFor="rebels_against_authority" className="text-sm">I tend to rebel against authority figures</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="leadership"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What's your leadership style?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="natural_leader" id="natural_leader" />
                          <label htmlFor="natural_leader" className="text-sm">Natural leader - I often take charge</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="prefers_following" id="prefers_following" />
                          <label htmlFor="prefers_following" className="text-sm">Prefers following - I'm comfortable being led</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="situational_leader" id="situational_leader" />
                          <label htmlFor="situational_leader" className="text-sm">Situational leader - I lead when needed</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="avoids_responsibility" id="avoids_responsibility" />
                          <label htmlFor="avoids_responsibility" className="text-sm">Avoids responsibility - I prefer not to lead</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Motivations & Triggers Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Motivations & Triggers</h3>
              
              <FormField
                control={form.control}
                name="primaryMotivations"
                render={() => (
                  <FormItem>
                    <FormLabel>What motivates you most? (Select all that apply)</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      {MOTIVATIONS.map((motivation) => (
                        <FormField
                          key={motivation}
                          control={form.control}
                          name="primaryMotivations"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(motivation)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, motivation])
                                      : field.onChange(field.value?.filter((value) => value !== motivation))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal capitalize">
                                {motivation.replace(/_/g, ' ')}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emotionalTriggers"
                render={() => (
                  <FormItem>
                    <FormLabel>What are your emotional triggers? (Select all that apply)</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      {EMOTIONAL_TRIGGERS.map((trigger) => (
                        <FormField
                          key={trigger}
                          control={form.control}
                          name="emotionalTriggers"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(trigger)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, trigger])
                                      : field.onChange(field.value?.filter((value) => value !== trigger))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal capitalize">
                                {trigger.replace(/_/g, ' ')}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comfortSources"
                render={() => (
                  <FormItem>
                    <FormLabel>What brings you comfort? (Select all that apply)</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      {COMFORT_SOURCES.map((source) => (
                        <FormField
                          key={source}
                          control={form.control}
                          name="comfortSources"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(source)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, source])
                                      : field.onChange(field.value?.filter((value) => value !== source))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal capitalize">
                                {source.replace(/_/g, ' ')}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
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