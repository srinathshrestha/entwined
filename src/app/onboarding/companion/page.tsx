"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { PartnerDesign } from "@/types";
import CompanionDesignForm from "@/components/onboarding/CompanionDesignForm";
import ProgressIndicator, {
  useOnboardingSteps,
} from "@/components/onboarding/ProgressIndicator";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function CompanionDesignPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const { steps, markStepCompleted, markStepSkipped } = useOnboardingSteps();
  const [initialData, setInitialData] = useState<
    Partial<PartnerDesign> | undefined
  >();
  const [companionInfo, setCompanionInfo] = useState<{
    name: string;
    gender: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchCompanionData();
    }
  }, [isLoaded, user]);

  const fetchCompanionData = async () => {
    try {
      const response = await fetch("/api/onboarding/companion");
      if (response.ok) {
        const data = await response.json();
        if (data.data.behavioralDesign) {
          setInitialData(data.data.behavioralDesign);
        }
        setCompanionInfo({
          name: data.data.name,
          gender: data.data.gender,
        });
      } else {
        // If companion not found, redirect to basic details
        const errorData = await response.json();
        if (errorData.error.includes("not found")) {
          toast.error("Please complete basic details first");
          router.push("/onboarding/basic");
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching companion data:", error);
      toast.error("Please complete basic details first");
      router.push("/onboarding/basic");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (data: PartnerDesign) => {
    try {
      const response = await fetch("/api/onboarding/companion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save companion design");
      }

      markStepCompleted("companion");
      toast.success("Companion design saved successfully!");
      router.push("/onboarding/relationship");
    } catch (error) {
      console.error("Error saving companion design:", error);
      toast.error("Failed to save companion design. Please try again.");
    }
  };

  const handleSkip = () => {
    markStepSkipped("companion");
    router.push("/onboarding/relationship");
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
              <p className="text-muted-foreground">Loading companion data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!companionInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground">
                Companion not found. Please complete basic details first.
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
          currentStepId="companion"
          onStepClick={handleStepNavigation}
          canNavigateBackward={true}
        />

        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Design {companionInfo.name}&apos;s Personality
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Customize how {companionInfo.name} behaves, responds, and interacts
            with you. This creates a unique companion tailored to your
            preferences.
          </p>
        </div>

        {/* Companion Design Form */}
        <CompanionDesignForm
          onComplete={handleComplete}
          onSkip={handleSkip}
          companionName={companionInfo.name}
          companionGender={companionInfo.gender}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
