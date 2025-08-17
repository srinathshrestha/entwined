"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Brain, X, MessageSquare } from "lucide-react";
import { SimplifiedMemory } from "@/types";
import MemoryTaggerV2 from "./MemoryTaggerV2";

interface MinimalChatInputProps {
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

export default function MinimalChatInput({
  onSendMessage,
  userId,
  companionId,
  isLoading = false,
  placeholder = "Message...",
  replyToMessage,
  onCancelReply,
}: MinimalChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedMemories, setSelectedMemories] = useState<SimplifiedMemory[]>(
    []
  );
  const [showMemoryTagger, setShowMemoryTagger] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea - ChatGPT style (starts small, grows as needed)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200); // Max 200px like ChatGPT
      textareaRef.current.style.height = `${newHeight}px`;
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

  const hasContent = message.trim().length > 0;

  return (
    <div className="w-full">
      {/* Reply Context - Minimal design */}
      <AnimatePresence>
        {replyToMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-2 mx-4"
          >
            <div className="bg-muted/50 rounded-lg p-2 border-l-2 border-primary text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground">
                    Replying to {replyToMessage.role === "user" ? "you" : "AI"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancelReply}
                  className="h-4 w-4 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-muted-foreground line-clamp-1 mt-1">
                {replyToMessage.content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Memories - Compact display */}
      <AnimatePresence>
        {selectedMemories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-2"
          >
            <div className="flex flex-wrap gap-1">
              {selectedMemories.map((memory) => (
                <Badge
                  key={memory.id}
                  variant="secondary"
                  className="flex items-center gap-1 text-xs py-0.5 px-2 bg-primary/10 text-primary border border-primary/20"
                >
                  <Brain className="h-3 w-3" />
                  <span className="max-w-[80px] truncate">
                    {memory.content}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMemory(memory.id)}
                    className="h-3 w-3 p-0 hover:bg-primary/20"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input - ChatGPT Style */}
      <div className="relative mx-4 mb-4">
        <div className="relative bg-background border border-border rounded-2xl shadow-sm focus-within:shadow-md transition-shadow">
          <div className="flex items-end gap-2 p-3">
            {/* Memory Tag Button - Left side */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMemoryTagger(true)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary flex-shrink-0 relative"
              disabled={isLoading}
              title="Tag memories"
            >
              <Brain className="h-4 w-4" />
              {selectedMemories.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 text-xs rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {selectedMemories.length}
                </span>
              )}
            </Button>

            {/* Textarea - Flexible middle */}
            <div className="flex-1 min-w-0">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                className="min-h-[24px] max-h-[200px] resize-none border-0 p-0 focus-visible:ring-0 text-sm bg-transparent placeholder:text-muted-foreground/60 leading-6"
                rows={1}
                style={{ height: "auto" }}
              />
            </div>

            {/* Send Button - Right side */}
            <Button
              onClick={handleSend}
              disabled={!hasContent || isLoading}
              size="sm"
              className={`h-8 w-8 p-0 rounded-lg flex-shrink-0 transition-all duration-200 ${
                hasContent && !isLoading
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

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
