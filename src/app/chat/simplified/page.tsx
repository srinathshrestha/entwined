"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Check, X, GitBranch, Users, Bot } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import MinimalChatInput from "@/components/chat/MinimalChatInput";
import MessageActionsV2 from "@/components/chat/MessageActionsV2";
import { SimplifiedMemory } from "@/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  parentId?: string;
  branchId?: string;
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

interface MessageBranch {
  id: string;
  name: string;
  parentMessageId: string;
  messages: ChatMessage[];
}

export default function SimplifiedChatPageV2() {
  const { user } = useUser();
  const router = useRouter();

  // States
  const [companion, setCompanion] = useState<CompanionInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [branches, setBranches] = useState<MessageBranch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<string>("main");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // Message interaction states
  const [replyToMessage, setReplyToMessage] = useState<{
    id: string;
    content: string;
    role: "user" | "assistant";
  } | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check onboarding status
  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  // Load companion and conversation history
  useEffect(() => {
    if (user && !isCheckingOnboarding) {
      loadCompanionAndHistory();
    }
  }, [user, isCheckingOnboarding]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch("/api/personality");
      if (response.ok) {
        const data = await response.json();
        if (!data.companion) {
          router.push("/onboarding/simplified");
          return;
        }
      } else {
        router.push("/onboarding/simplified");
        return;
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      router.push("/onboarding/simplified");
      return;
    } finally {
      setIsCheckingOnboarding(false);
    }
  };

  const loadCompanionAndHistory = async () => {
    try {
      setIsLoadingHistory(true);

      // Load companion info
      const companionResponse = await fetch("/api/personality");
      if (companionResponse.ok) {
        const companionData = await companionResponse.json();
        setCompanion(companionData.companion);
      }

      // Load conversation history
      const historyResponse = await fetch("/api/chat/simplified");
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setMessages(historyData.messages || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load conversation history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async (
    message: string,
    selectedMemories: SimplifiedMemory[],
    replyToMessageId?: string
  ) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
      parentId: replyToMessageId,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Clear reply state
    setReplyToMessage(null);

    try {
      const response = await fetch("/api/chat/simplified", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          selectedMemories,
          replyToMessageId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      // Add AI message placeholder
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        parentId: replyToMessageId,
      };

      setMessages((prev) => [...prev, aiMessage]);

      let aiResponseContent = "";

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
        console.log("Request aborted");
        return;
      }

      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");

      // Remove the user message that failed
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleReplyToMessage = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setReplyToMessage({
        id: message.id,
        content: message.content,
        role: message.role,
      });
    }
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message && message.role === "user") {
      setEditingMessage(messageId);
      setEditContent(message.content);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !editContent.trim()) return;

    try {
      // Update message locally
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editingMessage
            ? { ...msg, content: editContent.trim() }
            : msg
        )
      );

      // You would typically call an API to update the message in the database
      // await fetch(`/api/chat/messages/${editingMessage}`, {
      //   method: "PUT",
      //   body: JSON.stringify({ content: editContent.trim() }),
      // });

      setEditingMessage(null);
      setEditContent("");
      toast.success("Message updated");
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Failed to update message");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent("");
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Remove message locally
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      // Call API to delete message
      await fetch(`/api/chat/messages?messageId=${messageId}`, {
        method: "DELETE",
      });

      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleBranchMessage = (messageId: string) => {
    // Create a new branch from this message
    const branchName = `Branch ${branches.length + 1}`;
    const newBranch: MessageBranch = {
      id: `branch-${Date.now()}`,
      name: branchName,
      parentMessageId: messageId,
      messages: [],
    };

    setBranches((prev) => [...prev, newBranch]);
    setCurrentBranch(newBranch.id);
    toast.success(`Created ${branchName}`);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Loading states
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={companion?.avatarUrl || "/placeholder-avatar.png"}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {companion?.name?.charAt(0) || "AI"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-foreground">
                  {companion?.name || "Your Companion"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Online & Ready to Chat
                </p>
              </div>
            </div>

            {/* Branches & Settings */}
            <div className="flex items-center gap-2">
              {branches.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <GitBranch className="h-3 w-3 mr-1" />
                  {branches.length} branches
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/settings")}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              const isEditing = editingMessage === message.id;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-6 flex ${
                    isUser ? "justify-end" : "justify-start"
                  } group`}
                >
                  <div
                    className={`flex items-start space-x-3 max-w-[80%] ${
                      isUser ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {isUser ? (
                        <AvatarImage src={user.imageUrl} />
                      ) : (
                        <AvatarImage
                          src={
                            companion?.avatarUrl || "/placeholder-avatar.png"
                          }
                        />
                      )}
                      <AvatarFallback
                        className={
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }
                      >
                        {isUser ? (
                          <Users className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <Card
                      className={`${
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-card"
                      } shadow-sm`}
                    >
                      <CardContent className="py-3 px-4">
                        {isEditing ? (
                          <div className="space-y-3">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[60px] resize-none bg-background text-foreground"
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={!editContent.trim()}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>

                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs ${
                                  isUser
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {format(new Date(message.createdAt), "HH:mm")}
                              </span>

                              <MessageActionsV2
                                messageId={message.id}
                                messageContent={message.content}
                                messageRole={message.role}
                                onReply={handleReplyToMessage}
                                onEdit={handleEditMessage}
                                onDelete={handleDeleteMessage}
                                onBranch={handleBranchMessage}
                                className={
                                  isUser ? "text-primary-foreground" : ""
                                }
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
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
            className="flex justify-start mb-6"
          >
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={companion?.avatarUrl || "/placeholder-avatar.png"}
                />
                <AvatarFallback className="bg-muted">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {companion?.name || "AI"} is typing...
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Minimal Chat Input - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <MinimalChatInput
            onSendMessage={handleSendMessage}
            userId={user.id}
            companionId={companion?.id || ""}
            isLoading={isLoading}
            placeholder={`Message ${companion?.name || "your companion"}...`}
            replyToMessage={replyToMessage}
            onCancelReply={() => setReplyToMessage(null)}
          />
        </div>
      </div>
    </div>
  );
}
