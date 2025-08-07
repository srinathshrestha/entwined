"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface AvatarOption {
  id: string;
  url: string;
  category: string;
  name: string;
}

interface AvatarSelectorProps {
  onComplete: (selectedAvatar: AvatarOption) => void;
  companionName: string;
  companionGender: "male" | "female" | "non-binary";
  initialSelection?: string;
}

// Mock avatar data - In production, these would come from a backend API or CDN
const AVATAR_OPTIONS: Record<string, AvatarOption[]> = {
  male: [
    // Casual category
    { id: "m-casual-1", url: "/avatars/male/casual-1.png", category: "casual", name: "Casual Guy" },
    { id: "m-casual-2", url: "/avatars/male/casual-2.png", category: "casual", name: "Laid Back" },
    { id: "m-casual-3", url: "/avatars/male/casual-3.png", category: "casual", name: "Friendly" },
    { id: "m-casual-4", url: "/avatars/male/casual-4.png", category: "casual", name: "Relaxed" },
    
    // Professional category
    { id: "m-prof-1", url: "/avatars/male/professional-1.png", category: "professional", name: "Business" },
    { id: "m-prof-2", url: "/avatars/male/professional-2.png", category: "professional", name: "Executive" },
    { id: "m-prof-3", url: "/avatars/male/professional-3.png", category: "professional", name: "Sophisticated" },
    { id: "m-prof-4", url: "/avatars/male/professional-4.png", category: "professional", name: "Polished" },
    
    // Artistic category
    { id: "m-art-1", url: "/avatars/male/artistic-1.png", category: "artistic", name: "Creative" },
    { id: "m-art-2", url: "/avatars/male/artistic-2.png", category: "artistic", name: "Bohemian" },
    { id: "m-art-3", url: "/avatars/male/artistic-3.png", category: "artistic", name: "Expressive" },
    { id: "m-art-4", url: "/avatars/male/artistic-4.png", category: "artistic", name: "Unique" },
  ],
  female: [
    // Casual category
    { id: "f-casual-1", url: "/avatars/female/casual-1.png", category: "casual", name: "Casual Girl" },
    { id: "f-casual-2", url: "/avatars/female/casual-2.png", category: "casual", name: "Easy Going" },
    { id: "f-casual-3", url: "/avatars/female/casual-3.png", category: "casual", name: "Natural" },
    { id: "f-casual-4", url: "/avatars/female/casual-4.png", category: "casual", name: "Approachable" },
    
    // Professional category
    { id: "f-prof-1", url: "/avatars/female/professional-1.png", category: "professional", name: "Professional" },
    { id: "f-prof-2", url: "/avatars/female/professional-2.png", category: "professional", name: "Executive" },
    { id: "f-prof-3", url: "/avatars/female/professional-3.png", category: "professional", name: "Elegant" },
    { id: "f-prof-4", url: "/avatars/female/professional-4.png", category: "professional", name: "Confident" },
    
    // Artistic category
    { id: "f-art-1", url: "/avatars/female/artistic-1.png", category: "artistic", name: "Artistic" },
    { id: "f-art-2", url: "/avatars/female/artistic-2.png", category: "artistic", name: "Creative" },
    { id: "f-art-3", url: "/avatars/female/artistic-3.png", category: "artistic", name: "Expressive" },
    { id: "f-art-4", url: "/avatars/female/artistic-4.png", category: "artistic", name: "Unique" },
  ],
  "non-binary": [
    // Casual category
    { id: "nb-casual-1", url: "/avatars/non-binary/casual-1.png", category: "casual", name: "Casual Style" },
    { id: "nb-casual-2", url: "/avatars/non-binary/casual-2.png", category: "casual", name: "Comfortable" },
    { id: "nb-casual-3", url: "/avatars/non-binary/casual-3.png", category: "casual", name: "Relaxed" },
    { id: "nb-casual-4", url: "/avatars/non-binary/casual-4.png", category: "casual", name: "Natural" },
    
    // Professional category
    { id: "nb-prof-1", url: "/avatars/non-binary/professional-1.png", category: "professional", name: "Professional" },
    { id: "nb-prof-2", url: "/avatars/non-binary/professional-2.png", category: "professional", name: "Business" },
    { id: "nb-prof-3", url: "/avatars/non-binary/professional-3.png", category: "professional", name: "Polished" },
    { id: "nb-prof-4", url: "/avatars/non-binary/professional-4.png", category: "professional", name: "Sophisticated" },
    
    // Artistic category
    { id: "nb-art-1", url: "/avatars/non-binary/artistic-1.png", category: "artistic", name: "Creative" },
    { id: "nb-art-2", url: "/avatars/non-binary/artistic-2.png", category: "artistic", name: "Expressive" },
    { id: "nb-art-3", url: "/avatars/non-binary/artistic-3.png", category: "artistic", name: "Unique" },
    { id: "nb-art-4", url: "/avatars/non-binary/artistic-4.png", category: "artistic", name: "Artistic" },
  ],
};

const CATEGORIES = [
  { id: "casual", name: "Casual", description: "Relaxed and approachable" },
  { id: "professional", name: "Professional", description: "Polished and sophisticated" },
  { id: "artistic", name: "Artistic", description: "Creative and expressive" },
];

export default function AvatarSelector({
  onComplete,
  companionName,
  companionGender,
  initialSelection,
}: AvatarSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("casual");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption | null>(
    initialSelection
      ? AVATAR_OPTIONS[companionGender]?.find(avatar => avatar.id === initialSelection) || null
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableAvatars = AVATAR_OPTIONS[companionGender] || [];
  const categoryAvatars = availableAvatars.filter(avatar => avatar.category === selectedCategory);

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
          <h3 className="text-lg font-semibold">Style Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CATEGORIES.map((category) => (
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
                    <p className="text-sm text-muted-foreground">{category.description}</p>
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
              {CATEGORIES.find(c => c.id === selectedCategory)?.name} Avatars
            </h3>
            {selectedAvatar && (
              <Badge variant="secondary">
                Selected: {selectedAvatar.name}
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
                      <AvatarFallback className="text-lg">
                        {avatar.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-center">{avatar.name}</p>
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
                    <AvatarImage src={selectedAvatar.url} alt={selectedAvatar.name} />
                    <AvatarFallback className="text-lg">
                      {selectedAvatar.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{companionName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedAvatar.name} • {selectedCategory}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-background rounded-lg">
                  <p className="text-sm italic">
                    &quot;Hey there! This is how I&apos;ll appear in our conversations. Do you like this look?&quot;
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