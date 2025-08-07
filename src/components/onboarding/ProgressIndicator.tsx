"use client";

import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Step {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed?: boolean;
  skipped?: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStepId: string;
  onStepClick?: (stepId: string) => void;
  canNavigateBackward?: boolean;
}

export default function ProgressIndicator({
  steps,
  currentStepId,
  onStepClick,
  canNavigateBackward = true,
}: ProgressIndicatorProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
  const completedSteps = steps.filter(step => step.completed || step.skipped).length;
  const totalSteps = steps.length;
  const progressPercent = (completedSteps / totalSteps) * 100;

  const getStepStatus = (step: Step, index: number) => {
    if (step.completed) return "completed";
    if (step.skipped) return "skipped";
    if (index === currentStepIndex) return "current";
    if (index < currentStepIndex) return "incomplete";
    return "upcoming";
  };

  const canClickStep = (stepId: string, index: number) => {
    if (!onStepClick) return false;
    if (!canNavigateBackward) return false;
    return index <= currentStepIndex;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Setup Progress</span>
              <span>{completedSteps} of {totalSteps} steps</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Steps List */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const status = getStepStatus(step, index);
              const isClickable = canClickStep(step.id, index);
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                    status === "current"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : status === "completed"
                      ? "border-green-200 bg-green-50"
                      : status === "skipped"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-border"
                  } ${isClickable ? "cursor-pointer hover:bg-muted/50" : ""}`}
                  onClick={() => isClickable && onStepClick?.(step.id)}
                >
                  {/* Step Icon */}
                  <div className="flex-shrink-0">
                    {status === "completed" ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : status === "skipped" ? (
                      <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                        <ChevronRight className="w-4 h-4 text-white" />
                      </div>
                    ) : status === "current" ? (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-foreground">
                          {index + 1}
                        </span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-medium ${
                        status === "current" ? "text-primary" : "text-foreground"
                      }`}>
                        {step.title}
                      </h3>
                      {step.required ? (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Optional
                        </Badge>
                      )}
                      {status === "skipped" && (
                        <Badge variant="outline" className="text-xs">
                          Skipped
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm ${
                      status === "current" ? "text-primary/80" : "text-muted-foreground"
                    }`}>
                      {step.description}
                    </p>
                  </div>

                  {/* Navigation Arrow */}
                  {isClickable && (
                    <div className="flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation Hint */}
          {canNavigateBackward && (
            <div className="text-center text-sm text-muted-foreground">
              Click on completed steps to go back and edit them
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook to manage onboarding steps
export function useOnboardingSteps() {
  const [steps, setSteps] = React.useState<Step[]>([
    {
      id: "basic",
      title: "Basic Details",
      description: "Your information and companion setup",
      required: true,
      completed: false,
    },
    {
      id: "psychology",
      title: "Psychology Profile",
      description: "Your personality and behavioral patterns",
      required: false,
      completed: false,
    },
    {
      id: "companion",
      title: "Companion Design",
      description: "How your companion behaves and responds",
      required: false,
      completed: false,
    },
    {
      id: "relationship",
      title: "Relationship Context",
      description: "Your shared history and dynamics",
      required: false,
      completed: false,
    },
    {
      id: "avatar",
      title: "Avatar Selection",
      description: "Choose how your companion looks",
      required: true,
      completed: false,
    },
  ]);

  const markStepCompleted = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true, skipped: false } : step
    ));
  };

  const markStepSkipped = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, skipped: true, completed: false } : step
    ));
  };

  const resetStep = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: false, skipped: false } : step
    ));
  };

  const getNextStep = (currentStepId: string) => {
    const currentIndex = steps.findIndex(step => step.id === currentStepId);
    if (currentIndex === -1 || currentIndex === steps.length - 1) return null;
    return steps[currentIndex + 1];
  };

  const getPreviousStep = (currentStepId: string) => {
    const currentIndex = steps.findIndex(step => step.id === currentStepId);
    if (currentIndex <= 0) return null;
    return steps[currentIndex - 1];
  };

  const isOnboardingComplete = () => {
    return steps.filter(step => step.required).every(step => step.completed);
  };

  return {
    steps,
    markStepCompleted,
    markStepSkipped,
    resetStep,
    getNextStep,
    getPreviousStep,
    isOnboardingComplete,
  };
}