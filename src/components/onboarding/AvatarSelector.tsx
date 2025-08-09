"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AVATAR_CATEGORIES } from "@/lib/avatars/avatar-definitions";
import { AvatarPersonality } from "@/types";

interface AvatarOption {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  url: string;
}

interface AvatarSelectorProps {
  onComplete: (selectedAvatar: AvatarOption) => void;
  companionName: string;
  companionGender: "male" | "female" | "non-binary";
  initialSelection?: string;
}

// Transform avatar personalities into avatar options with gender-specific URLs
function createAvatarOptions(
  personalities: AvatarPersonality[],
  gender: string
): AvatarOption[] {
  return personalities.map((personality) => ({
    id: personality.id,
    code: personality.code,
    name: personality.name,
    description: personality.description,
    category: personality.id, // Use personality ID as category for organization
    url: `/${personality.code}.png`,
  }));
}

// Get all avatar options for a specific gender
function getAvatarOptionsForGender(gender: string): AvatarOption[] {
  const allPersonalities = AVATAR_CATEGORIES.flatMap(
    (category) => category.personalities
  );
  return createAvatarOptions(allPersonalities, gender);
}

export default function AvatarSelector({
  onComplete,
  companionName,
  companionGender,
  initialSelection,
}: AvatarSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("romantic");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(
    initialSelection
      ? getAvatarOptionsForGender(companionGender).find(
          (avatar) => avatar.id === initialSelection
        ) || null
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableAvatars = getAvatarOptionsForGender(companionGender);
  const categoryPersonalities =
    AVATAR_CATEGORIES.find((cat) => cat.id === selectedCategory)
      ?.personalities || [];
  const categoryAvatars = availableAvatars.filter((avatar) =>
    categoryPersonalities.some((p) => p.id === avatar.id)
  );

  const handleAvatarSelect = (avatar: AvatarOption) => {
    setSelectedAvatar(avatar);
  };

  const handleSubmit = async () => {
    if (!selectedAvatar) return;

    setIsSubmitting(true);
    try {
      await onComplete(selectedAvatar);
    } catch (error) {
      console.error("Error selecting avatar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Choose {companionName}&apos;s Avatar</CardTitle>
        <CardDescription>
          Select how you want {companionName} to appear in your conversations.
          You can change this later in your profile settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Relationship Style</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AVATAR_CATEGORIES.map((category) => (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all ${
                  selectedCategory === category.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4">
                  <div className="text-center">
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Avatar Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {AVATAR_CATEGORIES.find((c) => c.id === selectedCategory)?.name}{" "}
              Personalities
            </h3>
            {selectedAvatar && (
              <Badge variant="secondary">
                Selected: {selectedAvatar.name} ({selectedAvatar.code})
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoryAvatars.map((avatar) => (
              <Card
                key={avatar.id}
                className={`cursor-pointer transition-all ${
                  selectedAvatar?.id === avatar.id
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => handleAvatarSelect(avatar)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={avatar.url} alt={avatar.name} />
                      <AvatarFallback className="text-lg font-semibold">
                        {avatar.code}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <p className="text-sm font-medium">{avatar.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {avatar.code}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Selected Avatar Preview */}
        {selectedAvatar && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview</h3>
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={selectedAvatar.url}
                      alt={selectedAvatar.name}
                    />
                    <AvatarFallback className="text-lg">
                      {selectedAvatar.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{companionName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedAvatar.name} ({selectedAvatar.code}) •{" "}
                      {
                        AVATAR_CATEGORIES.find((c) => c.id === selectedCategory)
                          ?.name
                      }
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-background rounded-lg space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedAvatar.description}
                  </p>
                  <p className="text-sm italic">
                    &quot;Hey there! This personality style reflects how
                    I&apos;ll communicate and connect with you. Does this feel
                    right?&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleSubmit}
            disabled={!selectedAvatar || isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Creating..." : "Complete Setup"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}