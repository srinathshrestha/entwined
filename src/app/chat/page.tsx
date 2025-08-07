"use client";

import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  MoreHorizontal,
  Reply,
  Edit2,
  Trash2,
  Heart,
  X,
  Settings,
  User,
  Menu,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const { user } = useUser();
  const router = useRouter();
  const [companion, setCompanion] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<{
    id: string;
    content: string;
    role: string;
  } | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat",
    initialMessages: [],
    streamProtocol: "text", // Use text protocol to match our API response
    onResponse: async (response) => {
      console.log("AI response received");
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
    },
  });

  // Fetch companion data and conversation history on mount
  useEffect(() => {
    const fetchCompanion = async () => {
      try {
        const response = await fetch("/api/user/companion");
        if (response.ok) {
          const data = await response.json();
          setCompanion(data.companion);
        }
      } catch (error) {
        console.error("Error fetching companion:", error);
      }
    };

    const loadConversationHistory = async () => {
      try {
        const response = await fetch("/api/chat");
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
        }
      } catch (error) {
        console.error("Error loading conversation history:", error);
      }
    };

    if (user) {
      fetchCompanion();
      loadConversationHistory();
    }
  }, [user, setMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleReply = (message: {
    id: string;
    content: string;
    role: string;
  }) => {
    setReplyToMessage(message);
    const inputElement = document.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    inputElement?.focus();
  };

  const cancelReply = () => {
    setReplyToMessage(null);
  };

  const handleEdit = (messageId: string, content: string) => {
    setEditingMessage(messageId);
    setEditContent(content);
  };

  const saveEdit = async (messageId: string) => {
    try {
      const updatedMessages = messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, content: editContent, isEdited: true }
          : msg
      );
      setMessages(updatedMessages);
      setEditingMessage(null);
      setEditContent("");
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditContent("");
  };

  const handleDelete = async (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        // Call API to delete message from database
        const response = await fetch(
          `/api/chat/messages?messageId=${messageId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete message");
        }

        // Update local state only after successful API call
        const updatedMessages = messages.filter((msg) => msg.id !== messageId);
        setMessages(updatedMessages);
        toast.success("Message deleted successfully");
      } catch (error) {
        console.error("Error deleting message:", error);
        toast.error("Failed to delete message. Please try again.");
      }
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear reply state when submitting
    if (replyToMessage) {
      setReplyToMessage(null);
    }

    // Use the standard handleSubmit from useChat
    handleSubmit(e);
  };

  const getMessageDisplayContent = (msg: { content: string }) => {
    const replyMatch = msg.content.match(/^\[Replying to: "(.+?)"\] (.+)$/);
    if (replyMatch) {
      return {
        replyTo: replyMatch[1],
        content: replyMatch[2],
      };
    }
    return { content: msg.content };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="bg-rose-600 text-white">
                {companion?.name?.[0] || "AI"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-gray-900">
                {companion?.name || "Your AI Companion"}
              </h1>
              <p className="text-sm text-gray-500">Online</p>
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
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Start your conversation
            </h3>
            <p className="text-gray-600">
              Say hello to {companion?.name || "your companion"} and begin
              building your relationship!
            </p>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === "user";
          const displayContent = getMessageDisplayContent(message);

          return (
            <div
              key={message.id}
              className={`flex ${
                isUser ? "justify-end" : "justify-start"
              } group`}
            >
              <div className={`max-w-[70%] ${isUser ? "order-2" : "order-1"}`}>
                {displayContent.replyTo && (
                  <div className="text-xs text-gray-500 mb-1 px-3">
                    Replying to: &quot;{displayContent.replyTo}...&quot;
                  </div>
                )}

                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isUser
                      ? "bg-rose-600 text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  {editingMessage === message.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="text-sm"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            saveEdit(message.id);
                          } else if (e.key === "Escape") {
                            cancelEdit();
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveEdit(message.id)}
                          className="h-6 text-xs"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                          className="h-6 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{displayContent.content}</p>
                      {"isEdited" in message && message.isEdited && (
                        <span className="text-xs opacity-70 italic">
                          {" "}
                          (edited)
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-1 px-2">
                  <span className="text-xs text-gray-500">
                    {format(new Date(message.createdAt || Date.now()), "HH:mm")}
                  </span>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReply(message)}
                      className="h-6 w-6 p-0"
                    >
                      <Reply className="h-3 w-3" />
                    </Button>

                    {isUser ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleEdit(message.id, displayContent.content)
                          }
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(message.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      // Bot message - only show delete option
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(message.id)}
                        className="h-6 w-6 p-0"
                        title="Delete this message"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl px-4 py-2 max-w-[70%]">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          {replyToMessage && (
            <div className="bg-gray-100 rounded-lg p-2 mb-2 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-gray-600">Replying to: </span>
                <span className="text-gray-900">
                  &quot;{replyToMessage.content.substring(0, 50)}...&quot;
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelReply}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <form onSubmit={onSubmit} className="flex items-end space-x-2">
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder={`Message ${companion?.name || "your companion"}...`}
              className="flex-1 rounded-2xl resize-none min-h-[44px] max-h-32 overflow-y-auto"
              disabled={isLoading}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e as any);
                }
              }}
              style={{
                height: "auto",
                minHeight: "44px",
                maxHeight: "128px",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 128) + "px";
              }}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="rounded-full bg-rose-600 hover:bg-rose-700 w-10 h-10 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
