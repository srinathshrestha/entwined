"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  User,
  Brain,
  MessageSquare,
  Settings as SettingsIcon,
  Trash2,
  Heart,
  Sparkles,
  Zap,
  Tag,
  Clock,
  Star,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { SimplifiedMemory } from "@/types";

interface CompanionData {
  name: string;
  gender: string;
  affectionLevel: number;
  empathyLevel: number;
  curiosityLevel: number;
  playfulness: number;
  humorStyle: string;
  communicationStyle: string;
  userPreferredAddress: string;
  partnerPronouns: string;
  avatarUrl?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [companionData, setCompanionData] = useState<CompanionData | null>(null);
  const [memories, setMemories] = useState<SimplifiedMemory[]>([]);
  const [selectedMemories, setSelectedMemories] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showClearChatDialog, setShowClearChatDialog] = useState(false);

  // Load companion data and memories
  useEffect(() => {
    if (user) {
      loadCompanionData();
      loadMemories();
    }
  }, [user]);

  const loadCompanionData = async () => {
    try {
      const response = await fetch("/api/personality");
      if (response.ok) {
        const data = await response.json();
        if (data.companion) {
          setCompanionData(data.companion);
        }
      }
    } catch (error) {
      console.error("Error loading companion data:", error);
      toast.error("Failed to load companion data");
    }
  };

  const loadMemories = async () => {
    try {
      const response = await fetch("/api/memories");
      if (response.ok) {
        const data = await response.json();
        setMemories(data.memories || []);
      }
    } catch (error) {
      console.error("Error loading memories:", error);
      toast.error("Failed to load memories");
    }
  };

  const handlePersonalityUpdate = async () => {
    if (!companionData) return;

    setLoading(true);
    try {
      const response = await fetch("/api/personality", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companionData),
      });

      if (response.ok) {
        toast.success("Personality updated successfully!");
      } else {
        throw new Error("Failed to update personality");
      }
    } catch (error) {
      console.error("Error updating personality:", error);
      toast.error("Failed to update personality");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelectedMemories = async () => {
    if (selectedMemories.length === 0) return;

    setLoading(true);
    try {
      for (const memoryId of selectedMemories) {
        await fetch(`/api/memories?id=${memoryId}`, {
          method: "DELETE",
        });
      }
      
      toast.success(`Deleted ${selectedMemories.length} memories`);
      setSelectedMemories([]);
      setShowDeleteDialog(false);
      loadMemories(); // Reload memories
    } catch (error) {
      console.error("Error deleting memories:", error);
      toast.error("Failed to delete memories");
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllChats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/chat/messages?clearAll=true", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("All chat history cleared!");
        setShowClearChatDialog(false);
      } else {
        throw new Error("Failed to clear chats");
      }
    } catch (error) {
      console.error("Error clearing chats:", error);
      toast.error("Failed to clear chat history");
    } finally {
      setLoading(false);
    }
  };

  const toggleMemorySelection = (memoryId: string) => {
    setSelectedMemories(prev => 
      prev.includes(memoryId) 
        ? prev.filter(id => id !== memoryId)
        : [...prev, memoryId]
    );
  };

  const selectAllMemories = () => {
    setSelectedMemories(memories.map(m => m.id));
  };

  const clearSelection = () => {
    setSelectedMemories([]);
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return "text-red-500";
    if (importance >= 6) return "text-yellow-500";
    return "text-gray-500";
  };

  if (!companionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-purple-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
          <Badge variant="secondary" className="text-purple-600">
            Simplified System
          </Badge>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="personality" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personality" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personality
            </TabsTrigger>
            <TabsTrigger value="memories" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Memories
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          {/* Personality Settings */}
          <TabsContent value="personality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Companion Personality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Companion Name</Label>
                    <Input
                      value={companionData.name}
                      onChange={(e) => setCompanionData(prev => 
                        prev ? { ...prev, name: e.target.value } : null
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>How to Address You</Label>
                    <Input
                      value={companionData.userPreferredAddress}
                      onChange={(e) => setCompanionData(prev => 
                        prev ? { ...prev, userPreferredAddress: e.target.value } : null
                      )}
                    />
                  </div>
                </div>

                {/* Personality Traits */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Personality Traits</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { field: "affectionLevel" as keyof CompanionData, icon: Heart, title: "Affection Level", color: "text-red-500" },
                      { field: "empathyLevel" as keyof CompanionData, icon: Brain, title: "Empathy Level", color: "text-blue-500" },
                      { field: "curiosityLevel" as keyof CompanionData, icon: Sparkles, title: "Curiosity Level", color: "text-purple-500" },
                      { field: "playfulness" as keyof CompanionData, icon: Zap, title: "Playfulness", color: "text-yellow-500" },
                    ].map((trait) => (
                      <div key={trait.field} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <trait.icon className={`h-5 w-5 ${trait.color}`} />
                          <Label className="text-base font-medium">{trait.title}</Label>
                          <div className="text-2xl font-bold text-purple-600 ml-auto">
                            {companionData[trait.field] as number}
                          </div>
                        </div>
                        <Slider
                          value={[companionData[trait.field] as number]}
                          onValueChange={(value) => setCompanionData(prev => 
                            prev ? { ...prev, [trait.field]: value[0] } : null
                          )}
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
                      </div>
                    ))}
                  </div>
                </div>

                {/* Communication Styles */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Humor Style</Label>
                    <Select
                      value={companionData.humorStyle}
                      onValueChange={(value) => setCompanionData(prev => 
                        prev ? { ...prev, humorStyle: value } : null
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="playful">🎭 Playful - Light and fun</SelectItem>
                        <SelectItem value="witty">🧠 Witty - Clever and sharp</SelectItem>
                        <SelectItem value="gentle">😊 Gentle - Soft and warm</SelectItem>
                        <SelectItem value="sarcastic">😏 Sarcastic - Dry and ironic</SelectItem>
                        <SelectItem value="serious">🎯 Serious - Focused and direct</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Communication Style</Label>
                    <Select
                      value={companionData.communicationStyle}
                      onValueChange={(value) => setCompanionData(prev => 
                        prev ? { ...prev, communicationStyle: value } : null
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casual">👕 Casual - Relaxed and informal</SelectItem>
                        <SelectItem value="formal">👔 Formal - Professional and structured</SelectItem>
                        <SelectItem value="intimate">💕 Intimate - Close and personal</SelectItem>
                        <SelectItem value="professional">💼 Professional - Business-like</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handlePersonalityUpdate}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? "Updating..." : "Save Personality Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memory Management */}
          <TabsContent value="memories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Memory Management
                  </div>
                  <Badge variant="outline">
                    {memories.length} Total Memories
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Memory Controls */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    {selectedMemories.length > 0 ? (
                      <span>{selectedMemories.length} memories selected</span>
                    ) : (
                      <span>Select memories to delete</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllMemories}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      Clear Selection
                    </Button>
                    {selectedMemories.length > 0 && (
                      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Selected
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Memories</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete {selectedMemories.length} selected memories? 
                              This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteSelectedMemories}>
                              Delete {selectedMemories.length} Memories
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>

                {/* Memory List */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {memories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No memories found</p>
                      <p className="text-sm">Start chatting to create memories!</p>
                    </div>
                  ) : (
                    memories.map((memory) => (
                      <motion.div
                        key={memory.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedMemories.includes(memory.id) 
                            ? "border-purple-500 bg-purple-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => toggleMemorySelection(memory.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <p className="text-sm text-gray-900">{memory.content}</p>
                            
                            {/* Tags */}
                            {memory.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {memory.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {/* Metadata */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(memory.createdAt).toLocaleDateString()}
                              </div>
                              <div className={`flex items-center gap-1 ${getImportanceColor(memory.importance)}`}>
                                <Star className="h-3 w-3" />
                                {memory.importance}/10
                              </div>
                              {memory.userCreated && (
                                <Badge variant="outline" className="text-xs">User Created</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Settings */}
          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  Chat Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Clear Chat History */}
                <div className="border border-red-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="font-semibold">Danger Zone</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Clear All Chat History</h4>
                      <p className="text-sm text-gray-600">
                        This will permanently delete all your conversation history. 
                        Memories will not be affected.
                      </p>
                    </div>
                    
                    <Dialog open={showClearChatDialog} onOpenChange={setShowClearChatDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All Chats
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Clear All Chat History</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete all your chat conversations? 
                            This action cannot be undone. Your memories will remain intact.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowClearChatDialog(false)}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleClearAllChats}>
                            Yes, Clear All Chats
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Chat Features Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Chat Features</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Memory tagging available during conversations
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI responses adapt to your personality settings
                    </li>
                    <li className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Manual memory selection for context
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}