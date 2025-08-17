"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Settings,
  Brain,
  Sparkles,
  MoreVertical,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EnhancedChatInput from "@/components/chat/EnhancedChatInput";
import { SimplifiedMemory } from "@/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface CompanionInfo {
  name: string;
  id: string;
  affectionLevel: number;
  empathyLevel: number;
  curiosityLevel: number;
  playfulness: number;
  humorStyle: string;
  communicationStyle: string;
}

export default function SimplifiedChatPage() {
  const { user } = useUser();
  const router = useRouter();
  const [companion, setCompanion] = useState<CompanionInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load companion and conversation history
  useEffect(() => {
    if (user) {
      loadCompanionAndHistory();
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadCompanionAndHistory = async () => {
    try {
      setIsLoadingHistory(true);

      // Load conversation history
      const response = await fetch("/api/chat/simplified");
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);

        if (data.companion) {
          setCompanion(data.companion);
        }
      }

      // Also load full companion data
      const companionResponse = await fetch("/api/personality");
      if (companionResponse.ok) {
        const companionData = await companionResponse.json();
        if (companionData.companion) {
          setCompanion(companionData.companion);
        }
      }
    } catch (error) {
      console.error("Error loading chat data:", error);
      toast.error("Failed to load chat history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async (
    message: string,
    selectedMemories: SimplifiedMemory[]
  ) => {
    if (!message.trim() || isLoading) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);

      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: message,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Prepare request body
      const requestBody = {
        message,
        selectedMemories,
        conversationId: undefined, // Let the API handle this
      };

      // Send to simplified chat API
      const response = await fetch("/api/chat/simplified", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let aiResponseContent = "";
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      };

      // Add AI message placeholder
      setMessages((prev) => [...prev, aiMessage]);

      // Read the stream
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          aiResponseContent += chunk;

          // Update AI message content
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessage.id
                ? { ...msg, content: aiResponseContent }
                : msg
            )
          );
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Request was aborted");
        return;
      }

      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");

      // Remove the user message if there was an error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-sm border-b border-purple-200 px-4 py-4 sticky top-0 z-10"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 ring-2 ring-purple-200">
              <AvatarImage
                src={companion?.avatarUrl || "/placeholder-avatar.jpg"}
              />
              <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg">
                {companion?.name?.[0] || "AI"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-bold text-xl text-gray-900">
                {companion?.name || "Your AI Companion"}
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-600">Online & Ready to Chat</p>
              </div>
            </div>
          </div>

          {/* Companion Stats */}
          {companion && (
            <div className="hidden md:flex items-center gap-4">
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3 text-red-500" />
                  <span>Affection: {companion.affectionLevel}/10</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-3 w-3 text-blue-500" />
                  <span>Empathy: {companion.empathyLevel}/10</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/settings")}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="min-h-[calc(100vh-250px)] space-y-6">
          {/* Loading State */}
          {isLoadingHistory ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex justify-start"
                >
                  <Card className="max-w-[70%] bg-white">
                    <CardContent className="p-4">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-20"></div>
                </div>
                <MessageCircle className="h-16 w-16 text-purple-600 mx-auto relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Begin Your Journey with {companion?.name || "Your Companion"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start a conversation and experience personalized AI
                companionship with memory continuity and emotional intelligence.
              </p>
              <div className="flex justify-center gap-4">
                <Badge variant="secondary" className="text-sm py-2 px-4">
                  <Brain className="h-4 w-4 mr-2" />
                  Memory Tagging
                </Badge>
                <Badge variant="secondary" className="text-sm py-2 px-4">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Personality
                </Badge>
              </div>
            </motion.div>
          ) : (
            /* Messages */
            <AnimatePresence>
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <Card
                      className={`max-w-[80%] ${
                        isUser
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0"
                          : "bg-white border border-purple-100 shadow-sm"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p
                            className={`text-sm leading-relaxed ${
                              isUser ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {message.content}
                          </p>
                          <div
                            className={`flex items-center justify-between text-xs ${
                              isUser ? "text-purple-100" : "text-gray-500"
                            }`}
                          >
                            <span>
                              {format(new Date(message.createdAt), "HH:mm")}
                            </span>
                            {!isUser && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {/* Typing indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <Card className="bg-white border border-purple-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {companion?.name || "AI"} is typing...
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Chat Input */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-purple-200 p-4">
        <div className="max-w-4xl mx-auto">
          <EnhancedChatInput
            onSendMessage={handleSendMessage}
            userId={user.id}
            companionId={companion?.id || ""}
            isLoading={isLoading}
            placeholder={`Message ${companion?.name || "your companion"}...`}
          />
        </div>
      </div>
    </div>
  );
}
