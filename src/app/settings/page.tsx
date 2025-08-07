"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  User,
  Brain,
  MessageSquare,
  Settings as SettingsIcon,
  Trash2,
  Download,
  Upload,
  Shield,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();

  // Chat Settings State
  const [responseLength, setResponseLength] = useState("balanced");
  const [emotionalIntensity, setEmotionalIntensity] = useState([50]);
  const [initiativeLevel, setInitiativeLevel] = useState([50]);
  const [memorySensitivity, setMemorySensitivity] = useState([50]);

  // Privacy Controls State
  const [memoryCreation, setMemoryCreation] = useState(true);
  const [blacklistedTopics, setBlacklistedTopics] = useState("");
  const [safeMode, setSafeMode] = useState(false);

  // Message Management State
  const [autoDeleteDays, setAutoDeleteDays] = useState("never");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    // Load current settings
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        // Update state with loaded settings
        if (data.settings) {
          setResponseLength(data.settings.responseLength || "balanced");
          setEmotionalIntensity([data.settings.emotionalIntensity || 50]);
          setInitiativeLevel([data.settings.initiativeLevel || 50]);
          setMemorySensitivity([data.settings.memorySensitivity || 50]);
          setMemoryCreation(data.settings.memoryCreation ?? true);
          setBlacklistedTopics(data.settings.blacklistedTopics || "");
          setSafeMode(data.settings.safeMode || false);
          setAutoDeleteDays(data.settings.autoDeleteDays || "never");
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        responseLength,
        emotionalIntensity: emotionalIntensity[0],
        initiativeLevel: initiativeLevel[0],
        memorySensitivity: memorySensitivity[0],
        memoryCreation,
        blacklistedTopics,
        safeMode,
        autoDeleteDays,
      };

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Settings saved successfully!");
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings. Please try again.");
    }
  };

  const clearConversation = async () => {
    if (
      !confirm(
        "Are you sure you want to clear the conversation? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/chat/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: dateRange.start || null,
          endDate: dateRange.end || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Deleted ${data.deletedCount} messages successfully!`);
        setDateRange({ start: "", end: "" });
      } else {
        throw new Error("Failed to clear conversation");
      }
    } catch (error) {
      console.error("Error clearing conversation:", error);
      toast.error("Failed to clear conversation. Please try again.");
    }
  };

  const exportChatHistory = async () => {
    try {
      const response = await fetch("/api/chat/export");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chat-history-${
          new Date().toISOString().split("T")[0]
        }.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Chat history exported successfully!");
      } else {
        throw new Error("Failed to export chat history");
      }
    } catch (error) {
      console.error("Error exporting chat history:", error);
      toast.error("Failed to export chat history. Please try again.");
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="memory" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Memory
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 text-purple-600 mr-2" />
                    Psychology Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Complete or update your psychological profile for more
                    personalized responses.
                  </p>
                  <Button
                    onClick={() => router.push("/onboarding/psychology")}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Update Psychology Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 text-rose-600 mr-2" />
                    Companion Design
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Customize your AI companion's personality and behavior
                    patterns.
                  </p>
                  <Button
                    onClick={() => router.push("/onboarding/companion")}
                    className="w-full bg-rose-600 hover:bg-rose-700"
                  >
                    Update Companion Design
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 text-blue-600 mr-2" />
                    Relationship Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Update your relationship history and dynamics.
                  </p>
                  <Button
                    onClick={() => router.push("/onboarding/relationship")}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Update Relationship
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <SettingsIcon className="h-5 w-5 text-green-600 mr-2" />
                    Avatar & Basic Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Change your companion's avatar and basic information.
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
          </TabsContent>

          {/* Memory Management */}
          <TabsContent value="memory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Memory Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="memory-creation">Memory Creation</Label>
                      <p className="text-sm text-gray-500">
                        Allow AI to create memories from conversations
                      </p>
                    </div>
                    <Switch
                      id="memory-creation"
                      checked={memoryCreation}
                      onCheckedChange={setMemoryCreation}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Memory Creation Sensitivity</Label>
                    <p className="text-sm text-gray-500">
                      How aggressively the AI creates memories
                    </p>
                    <div className="px-2">
                      <Slider
                        value={memorySensitivity}
                        onValueChange={setMemorySensitivity}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Conservative</span>
                        <span>Balanced</span>
                        <span>Aggressive</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blacklisted-topics">
                      Blacklisted Topics
                    </Label>
                    <p className="text-sm text-gray-500">
                      Topics the AI won't create memories about
                      (comma-separated)
                    </p>
                    <Textarea
                      id="blacklisted-topics"
                      placeholder="e.g., work stress, family issues, health problems"
                      value={blacklistedTopics}
                      onChange={(e) => setBlacklistedTopics(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Button
                    onClick={() => router.push("/memories")}
                    variant="outline"
                    className="w-full"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    View & Manage Memories
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Settings */}
          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Behavior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Response Length Preference</Label>
                  <Select
                    value={responseLength}
                    onValueChange={setResponseLength}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Emotional Intensity</Label>
                  <div className="px-2">
                    <Slider
                      value={emotionalIntensity}
                      onValueChange={setEmotionalIntensity}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Calm</span>
                      <span>Balanced</span>
                      <span>Expressive</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Initiative Level</Label>
                  <div className="px-2">
                    <Slider
                      value={initiativeLevel}
                      onValueChange={setInitiativeLevel}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Passive</span>
                      <span>Balanced</span>
                      <span>Proactive</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Auto-delete Messages</Label>
                  <Select
                    value={autoDeleteDays}
                    onValueChange={setAutoDeleteDays}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="7">After 7 days</SelectItem>
                      <SelectItem value="30">After 30 days</SelectItem>
                      <SelectItem value="90">After 90 days</SelectItem>
                      <SelectItem value="365">After 1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <div>
                    <Label>Clear Conversation by Date Range</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, start: e.target.value })
                        }
                        className="rounded-md border border-gray-300 px-3 py-2"
                      />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, end: e.target.value })
                        }
                        className="rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <Button
                      onClick={clearConversation}
                      variant="destructive"
                      className="w-full mt-2"
                      disabled={!dateRange.start && !dateRange.end}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Messages in Range
                    </Button>
                  </div>

                  <Button
                    onClick={exportChatHistory}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Chat History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Controls */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="safe-mode">Safe Mode</Label>
                    <p className="text-sm text-gray-500">
                      Enable content filtering
                    </p>
                  </div>
                  <Switch
                    id="safe-mode"
                    checked={safeMode}
                    onCheckedChange={setSafeMode}
                  />
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Your conversations and memories are private and only
                    accessible to you. No data is shared with third parties.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={saveSettings}
            className="bg-rose-600 hover:bg-rose-700 px-8 py-3"
          >
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
