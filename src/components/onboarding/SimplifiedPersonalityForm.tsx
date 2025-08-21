"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sparkles, Heart, Zap, Smile, MessageCircle, User } from "lucide-react";
import { SimplifiedPersonality } from "@/types";

interface SimplifiedPersonalityFormProps {
  onComplete: (personality: SimplifiedPersonality) => void;
  companionName: string;
  initialData?: Partial<SimplifiedPersonality>;
}

export default function SimplifiedPersonalityForm({
  onComplete,
  companionName,
  initialData,
}: SimplifiedPersonalityFormProps) {
  const [personality, setPersonality] = useState<SimplifiedPersonality>({
    affectionLevel: initialData?.affectionLevel || 5,
    empathyLevel: initialData?.empathyLevel || 5,
    curiosityLevel: initialData?.curiosityLevel || 5,
    playfulness: initialData?.playfulness || 5,
    humorStyle: initialData?.humorStyle || "gentle",
    communicationStyle: initialData?.communicationStyle || "casual",
    userPreferredAddress: initialData?.userPreferredAddress || "you",
    partnerPronouns: initialData?.partnerPronouns || "they/them",
    backStory: initialData?.backStory || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSliderChange = (
    field: keyof SimplifiedPersonality,
    value: number[]
  ) => {
    setPersonality((prev) => ({ ...prev, [field]: value[0] }));
  };

  const handleSelectChange = (
    field: keyof SimplifiedPersonality,
    value: string
  ) => {
    setPersonality((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (
    field: keyof SimplifiedPersonality,
    value: string
  ) => {
    setPersonality((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(personality);
    } catch (error) {
      console.error("Error saving personality:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const traitCards = [
    {
      field: "affectionLevel" as keyof SimplifiedPersonality,
      icon: Heart,
      title: "Affection Level",
      description: "How openly affectionate and loving",
      color: "text-red-500",
    },
    {
      field: "empathyLevel" as keyof SimplifiedPersonality,
      icon: User,
      title: "Empathy Level",
      description: "How understanding and emotionally connected",
      color: "text-blue-500",
    },
    {
      field: "curiosityLevel" as keyof SimplifiedPersonality,
      icon: Sparkles,
      title: "Curiosity Level",
      description: "How inquisitive and interested in learning",
      color: "text-purple-500",
    },
    {
      field: "playfulness" as keyof SimplifiedPersonality,
      icon: Zap,
      title: "Playfulness",
      description: "How fun-loving and spontaneous",
      color: "text-yellow-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.h2
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-3xl font-bold text-gray-900"
        >
          Customize {companionName}&apos;s Personality
        </motion.h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Fine-tune how {companionName} will interact with you. These settings
          shape their personality and communication style.
        </p>
      </div>

      {/* Personality Traits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Personality Traits
          </CardTitle>
          <CardDescription>
            Adjust each trait on a scale of 1-10 to shape {companionName}&apos;s
            core personality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {traitCards.map((trait, index) => (
              <motion.div
                key={trait.field}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <trait.icon className={`h-5 w-5 ${trait.color}`} />
                  <div className="flex-1">
                    <Label className="text-base font-semibold">
                      {trait.title}
                    </Label>
                    <p className="text-sm text-gray-600">{trait.description}</p>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {personality[trait.field] as number}
                  </div>
                </div>
                <Slider
                  value={[personality[trait.field] as number]}
                  onValueChange={(value) =>
                    handleSliderChange(trait.field, value)
                  }
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Communication Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Communication Style
          </CardTitle>
          <CardDescription>
            Choose how {companionName} expresses themselves and communicates
            with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="humor-style">Humor Style</Label>
              <Select
                value={personality.humorStyle}
                onValueChange={(value) =>
                  handleSelectChange("humorStyle", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select humor style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="playful">
                    🎭 Playful - Light and fun
                  </SelectItem>
                  <SelectItem value="witty">
                    🧠 Witty - Clever and sharp
                  </SelectItem>
                  <SelectItem value="gentle">
                    😊 Gentle - Soft and warm
                  </SelectItem>
                  <SelectItem value="sarcastic">
                    😏 Sarcastic - Dry and ironic
                  </SelectItem>
                  <SelectItem value="serious">
                    🎯 Serious - Focused and direct
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-2"
            >
              <Label htmlFor="communication-style">Communication Style</Label>
              <Select
                value={personality.communicationStyle}
                onValueChange={(value) =>
                  handleSelectChange("communicationStyle", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select communication style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">
                    👕 Casual - Relaxed and informal
                  </SelectItem>
                  <SelectItem value="formal">
                    👔 Formal - Professional and structured
                  </SelectItem>
                  <SelectItem value="intimate">
                    💕 Intimate - Close and personal
                  </SelectItem>
                  <SelectItem value="professional">
                    💼 Professional - Business-like
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Interaction Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="h-5 w-5 text-green-500" />
            Interaction Preferences
          </CardTitle>
          <CardDescription>
            Customize how {companionName} addresses you and their preferred
            pronouns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="space-y-2"
            >
              <Label htmlFor="user-address">
                How should {companionName} address you?
              </Label>
              <Input
                id="user-address"
                value={personality.userPreferredAddress}
                onChange={(e) =>
                  handleInputChange("userPreferredAddress", e.target.value)
                }
                placeholder="e.g., your name, nickname, or 'you'"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="space-y-2"
            >
              <Label htmlFor="partner-pronouns">
                {companionName}&apos;s Pronouns
              </Label>
              <Select
                value={personality.partnerPronouns}
                onValueChange={(value) =>
                  handleSelectChange("partnerPronouns", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pronouns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="he/him">He/Him</SelectItem>
                  <SelectItem value="she/her">She/Her</SelectItem>
                  <SelectItem value="they/them">They/Them</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* BackStory Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="space-y-2 col-span-2"
            >
              <Label htmlFor="back-story">
                {companionName}&apos;s Background Story (Optional)
              </Label>
              <Textarea
                id="back-story"
                value={personality.backStory}
                onChange={(e) => handleInputChange("backStory", e.target.value)}
                placeholder="Describe your companion's background, history, personality details, or any narrative that helps define who they are..."
                className="min-h-[100px] resize-none"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Add depth to your companion with a background story. This helps
                the AI understand their personality, history, and unique traits.
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">
              Personality Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>Affection Level:</strong> {personality.affectionLevel}/10
            </div>
            <div>
              <strong>Empathy Level:</strong> {personality.empathyLevel}/10
            </div>
            <div>
              <strong>Curiosity Level:</strong> {personality.curiosityLevel}/10
            </div>
            <div>
              <strong>Playfulness:</strong> {personality.playfulness}/10
            </div>
            <div>
              <strong>Humor Style:</strong> {personality.humorStyle}
            </div>
            <div>
              <strong>Communication Style:</strong>{" "}
              {personality.communicationStyle}
            </div>
            <div>
              <strong>Address user as:</strong>{" "}
              {personality.userPreferredAddress}
            </div>
            <div>
              <strong>Use pronouns:</strong> {personality.partnerPronouns}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="flex justify-center pt-6"
      >
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="px-8"
        >
          {isSubmitting ? "Saving..." : `Complete ${companionName}'s Setup`}
        </Button>
      </motion.div>
    </motion.div>
  );
}
