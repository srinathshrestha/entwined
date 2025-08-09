"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import AvatarSelector from "@/components/onboarding/AvatarSelector";
import ProgressIndicator, {
  useOnboardingSteps,
} from "@/components/onboarding/ProgressIndicator";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface AvatarOption {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  url: string;
}

export default function AvatarPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const { steps, markStepCompleted } = useOnboardingSteps();
  const [companionInfo, setCompanionInfo] = useState<{
    name: string;
    gender: "male" | "female" | "non-binary";
    currentAvatar?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchAvatarData();
    }
  }, [isLoaded, user]);

  const fetchAvatarData = async () => {
    try {
      const response = await fetch("/api/onboarding/avatar");
      if (response.ok) {
        const data = await response.json();
        setCompanionInfo({
          name: data.data.name,
          gender: data.data.gender,
          currentAvatar: data.data.avatarUrl,
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
      console.error("Error fetching avatar data:", error);
      toast.error("Please complete basic details first");
      router.push("/onboarding/basic");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (selectedAvatar: AvatarOption) => {
    try {
      const response = await fetch("/api/onboarding/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarUrl: selectedAvatar.url,
          avatarCategory: selectedAvatar.category,
          avatarPersonality: selectedAvatar.code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save avatar selection");
      }

      markStepCompleted("avatar");
      toast.success("Avatar selected successfully! Welcome to Entwined!");

      // Avatar is the final required step, so onboarding is complete
      router.push("/chat");
    } catch (error) {
      console.error("Error saving avatar selection:", error);
      toast.error("Failed to save avatar selection. Please try again.");
    }
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
              <p className="text-muted-foreground">Loading avatar data...</p>
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
          currentStepId="avatar"
          onStepClick={handleStepNavigation}
          canNavigateBackward={true}
        />

        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Choose {companionInfo.name}&apos;s Avatar
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose {companionInfo.name}&apos;s personality style. This will
            determine how they communicate and connect with you. Each
            personality has its own unique tone and approach to conversations.
          </p>
        </div>

        {/* Avatar Selector */}
        <AvatarSelector
          onComplete={handleComplete}
          companionName={companionInfo.name}
          companionGender={companionInfo.gender}
          initialSelection={companionInfo.currentAvatar}
        />
      </div>
    </div>
  );
}
