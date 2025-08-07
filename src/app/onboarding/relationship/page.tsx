"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { RelationshipHistory, EarlyRelationship } from "@/types";
import RelationshipForm from "@/components/onboarding/RelationshipForm";
import ProgressIndicator, {
  useOnboardingSteps,
} from "@/components/onboarding/ProgressIndicator";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function RelationshipPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const { steps, markStepCompleted, markStepSkipped } = useOnboardingSteps();
  const [initialData, setInitialData] = useState<
    Partial<RelationshipHistory | EarlyRelationship> | undefined
  >();
  const [relationshipInfo, setRelationshipInfo] = useState<{
    status: string;
    companionName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchRelationshipData();
    }
  }, [isLoaded, user]);

  const fetchRelationshipData = async () => {
    try {
      const response = await fetch("/api/onboarding/relationship");
      if (response.ok) {
        const data = await response.json();
        if (data.data.relationshipHistory) {
          setInitialData(data.data.relationshipHistory);
        }
        setRelationshipInfo({
          status: data.data.relationshipStatus || "JUST_MET",
          companionName: data.data.companionName || "your companion",
        });
      } else {
        // If user/relationship not found, redirect to basic details
        const errorData = await response.json();
        if (errorData.error.includes("not found")) {
          toast.error("Please complete basic details first");
          router.push("/onboarding/basic");
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching relationship data:", error);
      toast.error("Please complete basic details first");
      router.push("/onboarding/basic");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (
    data: RelationshipHistory | EarlyRelationship
  ) => {
    try {
      const response = await fetch("/api/onboarding/relationship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          relationshipStatus: relationshipInfo?.status,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to save relationship context"
        );
      }

      markStepCompleted("relationship");
      toast.success("Relationship context saved successfully!");
      router.push("/onboarding/avatar");
    } catch (error) {
      console.error("Error saving relationship context:", error);
      toast.error("Failed to save relationship context. Please try again.");
    }
  };

  const handleSkip = () => {
    markStepSkipped("relationship");
    router.push("/onboarding/avatar");
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
                Loading relationship data...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!relationshipInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground">
                Relationship data not found. Please complete basic details
                first.
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
          currentStepId="relationship"
          onStepClick={handleStepNavigation}
          canNavigateBackward={true}
        />

        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Share Your Relationship Story
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us about your journey with {relationshipInfo.companionName}.
            This helps create authentic conversations about your shared
            experiences and memories.
          </p>
        </div>

        {/* Relationship Form */}
        <RelationshipForm
          onComplete={handleComplete}
          onSkip={handleSkip}
          relationshipStatus={relationshipInfo.status}
          companionName={relationshipInfo.companionName}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
