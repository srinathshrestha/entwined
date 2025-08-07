"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";

export default function OnboardingPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const determineOnboardingStep = useCallback(async () => {
    try {
      const response = await fetch("/api/onboarding/basic");
      
      if (response.ok) {
        const data = await response.json();
        const { currentStep, stepsCompleted } = data.data;
        
        // Route to appropriate step
        if (!stepsCompleted.includes("basic")) {
          router.push("/onboarding/basic");
        } else if (currentStep === "psychology") {
          router.push("/onboarding/psychology");
        } else if (currentStep === "companion") {
          router.push("/onboarding/companion");
        } else if (currentStep === "relationship") {
          router.push("/onboarding/relationship");
        } else if (currentStep === "avatar") {
          router.push("/onboarding/avatar");
        } else {
          // Onboarding complete, go to chat
          router.push("/chat");
        }
      } else {
        // User doesn't exist, start from basic
        router.push("/onboarding/basic");
      }
    } catch (error) {
      console.error("Error determining onboarding step:", error);
      // Default to basic step on error
      router.push("/onboarding/basic");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isLoaded && user) {
      determineOnboardingStep();
    }
  }, [isLoaded, user, determineOnboardingStep]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Setting up your experience...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}