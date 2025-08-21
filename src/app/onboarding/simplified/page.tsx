"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SimplifiedPersonalityForm from "@/components/onboarding/SimplifiedPersonalityForm";
import { SimplifiedPersonality } from "@/types";
import { Heart, Sparkles, User } from "lucide-react";

export default function SimplifiedOnboardingPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState<"basic" | "personality">("basic");
  const [loading, setLoading] = useState(false);

  // Basic info state
  const [basicInfo, setBasicInfo] = useState({
    companionName: "",
    companionGender: "" as "male" | "female" | "non-binary",
  });

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, router]);

  const handleBasicInfoSubmit = () => {
    if (!basicInfo.companionName || !basicInfo.companionGender) {
      toast.error("Please fill in all basic information");
      return;
    }
    setStep("personality");
  };

  const handlePersonalityComplete = async (
    personality: SimplifiedPersonality
  ) => {
    setLoading(true);
    try {
      const response = await fetch("/api/personality", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: basicInfo.companionName,
          gender: basicInfo.companionGender,
          ...personality,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save personality");
      }

      toast.success("Your AI companion is ready!");
      router.push("/chat");
    } catch (error) {
      console.error("Error saving personality:", error);
      toast.error("Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Create Your AI Companion
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            A simple, personalized setup to get you started
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                step === "basic"
                  ? "bg-purple-600 text-white"
                  : "bg-background text-primary"
              }`}
            >
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Basic Info</span>
            </div>
            <div className="w-8 h-0.5 bg-border"></div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                step === "personality"
                  ? "bg-purple-600 text-white"
                  : "bg-background text-primary"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Personality</span>
            </div>
          </div>
        </motion.div>

        {/* Basic Info Step */}
        {step === "basic" && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Let&apos;s start with the basics
                  </h2>
                  <p className="text-gray-600">
                    Tell us about your AI companion
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="companion-name"
                      className="text-base font-medium"
                    >
                      What should we call your companion?
                    </Label>
                    <Input
                      id="companion-name"
                      value={basicInfo.companionName}
                      onChange={(e) =>
                        setBasicInfo((prev) => ({
                          ...prev,
                          companionName: e.target.value,
                        }))
                      }
                      placeholder="Enter a name for your companion"
                      className="text-lg p-3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="companion-gender"
                      className="text-base font-medium"
                    >
                      Companion&apos;s Gender
                    </Label>
                    <Select
                      value={basicInfo.companionGender}
                      onValueChange={(
                        value: "male" | "female" | "non-binary"
                      ) =>
                        setBasicInfo((prev) => ({
                          ...prev,
                          companionGender: value,
                        }))
                      }
                    >
                      <SelectTrigger className="text-lg p-3">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-6">
                    <Button
                      onClick={handleBasicInfoSubmit}
                      className="w-full text-lg py-3"
                      size="lg"
                    >
                      Continue to Personality Setup
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Personality Step */}
        {step === "personality" && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SimplifiedPersonalityForm
              onComplete={handlePersonalityComplete}
              companionName={basicInfo.companionName}
            />
          </motion.div>
        )}

        {/* Back Button */}
        {step === "personality" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-6"
          >
            <Button
              variant="outline"
              onClick={() => setStep("basic")}
              disabled={loading}
            >
              Back to Basic Info
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
