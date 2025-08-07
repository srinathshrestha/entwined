"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UserPsychology } from "@/types";
import PsychologyForm from "@/components/onboarding/PsychologyForm";
import ProgressIndicator, {
  useOnboardingSteps,
} from "@/components/onboarding/ProgressIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function PsychologyPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const { steps, markStepCompleted, markStepSkipped } = useOnboardingSteps();
  const [initialData, setInitialData] = useState<
    Partial<UserPsychology> | undefined
  >();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      // Fetch existing psychology profile if available
      fetchPsychologyProfile();
    }
  }, [isLoaded, user]);

  const fetchPsychologyProfile = async () => {
    try {
      const response = await fetch("/api/onboarding/psychology");
      if (response.ok) {
        const data = await response.json();
        if (data.data.psychologyProfile) {
          setInitialData(data.data.psychologyProfile);
        }
      } else {
        // If user not found, redirect to basic details
        const errorData = await response.json();
        if (errorData.error.includes("not found")) {
          toast.error("Please complete basic details first");
          router.push("/onboarding/basic");
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching psychology profile:", error);
      toast.error("Please complete basic details first");
      router.push("/onboarding/basic");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (data: UserPsychology) => {
    try {
      const response = await fetch("/api/onboarding/psychology", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save psychology profile");
      }

      markStepCompleted("psychology");
      toast.success("Psychology profile saved successfully!");
      router.push("/onboarding/companion");
    } catch (error) {
      console.error("Error saving psychology profile:", error);
      toast.error("Failed to save psychology profile. Please try again.");
    }
  };

  const handleSkip = () => {
    markStepSkipped("psychology");
    router.push("/onboarding/companion");
  };

  const handleStepNavigation = (stepId: string) => {
    router.push(`/onboarding/${stepId}`);
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading psychology profile...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 space-y-8">
        {/* Progress Indicator */}
        <ProgressIndicator
          steps={steps}
          currentStepId="psychology"
          onStepClick={handleStepNavigation}
          canNavigateBackward={true}
        />

        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Tell Us About Your Personality
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help us understand your unique personality traits and behavioral
            patterns. This creates more authentic and meaningful interactions
            with your AI companion.
          </p>
        </div>

        {/* Psychology Form */}
        <PsychologyForm
          onComplete={handleComplete}
          onSkip={handleSkip}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
