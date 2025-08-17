"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Send,
  Brain,
  X,
  Plus,
  MessageSquare,
  Users,
  Settings as SettingsIcon,
  Sparkles,
} from "lucide-react";
import { SimplifiedMemory } from "@/types";
import MemoryTaggerV2 from "./MemoryTaggerV2";

interface EnhancedChatInputV2Props {
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

export default function EnhancedChatInputV2({
  onSendMessage,
  userId,
  companionId,
  isLoading = false,
  placeholder = "Type your message...",
  replyToMessage,
  onCancelReply,
}: EnhancedChatInputV2Props) {
  const [message, setMessage] = useState("");
  const [selectedMemories, setSelectedMemories] = useState<SimplifiedMemory[]>(
    []
  );
  const [showMemoryTagger, setShowMemoryTagger] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea with smaller height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
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
            className="flex flex-wrap gap-2"
          >
            {selectedMemories.map((memory) => (
              <Badge
                key={memory.id}
                variant="secondary"
                className="flex items-center gap-2 text-xs py-1 px-2 bg-purple-100 text-purple-700 border border-purple-200"
              >
                <Brain className="h-3 w-3" />
                <span className="max-w-[100px] truncate">{memory.content}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMemory(memory.id)}
                  className="h-3 w-3 p-0 hover:bg-purple-200"
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area - Smaller Height */}
      <Card className="border border-border focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
        <CardContent className="p-3">
          <div className="flex items-end gap-2">
            {/* Textarea - Reduced min height */}
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                className="min-h-[40px] max-h-[120px] resize-none border-0 p-0 focus-visible:ring-0 text-sm bg-transparent"
                style={{ height: "auto" }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Memory Tagger Icon - Single Icon */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMemoryTagger(true)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary relative"
                disabled={isLoading}
                title="Tag memories"
              >
                <Brain className="h-4 w-4" />
                {selectedMemories.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs rounded-full bg-primary text-primary-foreground"
                  >
                    {selectedMemories.length}
                  </Badge>
                )}
              </Button>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
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
