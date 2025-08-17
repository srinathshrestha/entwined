"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Send,
  Brain,
  X,
  MessageSquare,
  Plus,
  Paperclip,
  Mic,
  Smile,
} from "lucide-react";
import { SimplifiedMemory } from "@/types";
import MemoryTaggerV2 from "./MemoryTaggerV2";

interface ModernChatInputProps {
  onSendMessage: (
    message: string,
    selectedMemories: SimplifiedMemory[],
    replyToMessageId?: string
  ) => void;
  userId: string;
  companionId: string;
  isLoading?: boolean;
  placeholder?: string;
  replyToMessage?: {
    id: string;
    content: string;
    role: "user" | "assistant";
  } | null;
  onCancelReply?: () => void;
}

export default function ModernChatInput({
  onSendMessage,
  userId,
  companionId,
  isLoading = false,
  placeholder = "Type your message...",
  replyToMessage,
  onCancelReply,
}: ModernChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedMemories, setSelectedMemories] = useState<SimplifiedMemory[]>(
    []
  );
  const [showMemoryTagger, setShowMemoryTagger] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea with smaller height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        100
      )}px`; // Reduced max height to 100px
    }
  }, [message]);

  // Focus textarea when replying
  useEffect(() => {
    if (replyToMessage && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyToMessage]);

  const handleSend = () => {
    if (!message.trim() || isLoading) return;

    onSendMessage(message.trim(), selectedMemories, replyToMessage?.id);
    setMessage("");
    setSelectedMemories([]);

    // Clear reply if exists
    if (replyToMessage && onCancelReply) {
      onCancelReply();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // ESC to cancel reply
    if (e.key === "Escape" && replyToMessage && onCancelReply) {
      onCancelReply();
    }
  };

  const removeMemory = (memoryId: string) => {
    setSelectedMemories((prev) => prev.filter((m) => m.id !== memoryId));
  };

  const handleMemorySelect = (memories: SimplifiedMemory[]) => {
    setSelectedMemories(memories);
    setShowMemoryTagger(false);
  };

  return (
    <div className="space-y-2">
      {/* Reply Context */}
      <AnimatePresence>
        {replyToMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-muted/50 rounded-lg p-3 border-l-4 border-primary"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Replying to {replyToMessage.role === "user" ? "you" : "AI"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {replyToMessage.content}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelReply}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Memories Display */}
      <AnimatePresence>
        {selectedMemories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 px-1"
          >
            {selectedMemories.map((memory) => (
              <Badge
                key={memory.id}
                variant="secondary"
                className="flex items-center gap-2 text-xs py-1 px-2 bg-primary/10 text-primary border border-primary/20"
              >
                <Brain className="h-3 w-3" />
                <span className="max-w-[120px] truncate">{memory.content}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMemory(memory.id)}
                  className="h-3 w-3 p-0 hover:bg-primary/20 ml-1"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Container - Modern Design */}
      <Card
        className={`transition-all duration-200 border-2 ${
          isFocused
            ? "border-primary shadow-lg ring-2 ring-primary/10"
            : "border-border hover:border-primary/30"
        }`}
      >
        <div className="p-3">
          {/* Textarea Container */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={isLoading}
              className="min-h-[32px] max-h-[100px] resize-none border-0 p-0 focus-visible:ring-0 text-sm bg-transparent placeholder:text-muted-foreground/60"
              style={{ height: "auto" }}
            />
          </div>

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
            {/* Left Side - Tools */}
            <div className="flex items-center gap-1">
              {/* Memory Brain Icon */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMemoryTagger(true)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary relative"
                disabled={isLoading}
                title="Add memories"
              >
                <Brain className="h-4 w-4" />
                {selectedMemories.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 text-xs rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    {selectedMemories.length}
                  </span>
                )}
              </Button>

              {/* Future: Attachment */}
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="h-8 w-8 p-0 text-muted-foreground/40"
                title="Attachments (Coming Soon)"
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              {/* Future: Voice */}
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="h-8 w-8 p-0 text-muted-foreground/40"
                title="Voice message (Coming Soon)"
              >
                <Mic className="h-4 w-4" />
              </Button>

              {/* Future: Emoji */}
              <Button
                variant="ghost"
                size="sm"
                disabled
                className="h-8 w-8 p-0 text-muted-foreground/40"
                title="Emoji (Coming Soon)"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            {/* Right Side - Send */}
            <div className="flex items-center gap-2">
              {/* Character count for longer messages */}
              {message.length > 200 && (
                <span className="text-xs text-muted-foreground">
                  {message.length}/2000
                </span>
              )}

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                size="sm"
                className="h-8 px-3 rounded-full transition-all duration-200"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
                <span className="ml-1 text-xs hidden sm:inline">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Memory Tagger Modal */}
      <MemoryTaggerV2
        userId={userId}
        companionId={companionId}
        onMemorySelect={handleMemorySelect}
        isOpen={showMemoryTagger}
        onClose={() => setShowMemoryTagger(false)}
        selectedMemories={selectedMemories}
      />
    </div>
  );
}
