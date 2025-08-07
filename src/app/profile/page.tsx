"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Heart, Settings, Brain } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/chat")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Profile & Settings
          </h1>
        </div>

        {/* Profile Options Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Psychology Profile */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 text-purple-600 mr-2" />
                Psychology Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Complete or update your psychological profile to get more
                personalized responses from your AI companion.
              </p>
              <Button
                onClick={() => router.push("/onboarding/psychology")}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Update Psychology Profile
              </Button>
            </CardContent>
          </Card>

          {/* Companion Design */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 text-rose-600 mr-2" />
                Companion Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Customize your AI companion&apos;s personality, behavior
                patterns, and emotional responses.
              </p>
              <Button
                onClick={() => router.push("/onboarding/companion")}
                className="w-full bg-rose-600 hover:bg-rose-700"
              >
                Update Companion Design
              </Button>
            </CardContent>
          </Card>

          {/* Relationship Context */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                Relationship Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Update your relationship history and dynamics to help your
                companion understand your shared context.
              </p>
              <Button
                onClick={() => router.push("/onboarding/relationship")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Update Relationship
              </Button>
            </CardContent>
          </Card>

          {/* Avatar & Basic Info */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 text-green-600 mr-2" />
                Avatar & Basic Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Change your companion&apos;s avatar and update basic information
                like names, ages, and locations.
              </p>
              <Button
                onClick={() => router.push("/onboarding/avatar")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Update Avatar & Info
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Settings */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 text-gray-600 mr-2" />
                Additional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={() => router.push("/memories")}
                className="w-full justify-start"
              >
                <Brain className="h-4 w-4 mr-2" />
                Memory Management
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/settings")}
                className="w-full justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                Chat & App Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
