"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Brain, Tag, X, Sparkles, Plus, Zap } from "lucide-react";
import { SimplifiedMemory } from "@/types";
import MemoryTagger from "./MemoryTagger";
import { suggestRelevantMemoryTags } from "@/lib/ai/simplified-behavioral-framework";

interface EnhancedChatInputProps {
  onSendMessage: (
    message: string,
    selectedMemories: SimplifiedMemory[]
  ) => void;
  userId: string;
  companionId: string;
  isLoading?: boolean;
  placeholder?: string;
}

export default function EnhancedChatInput({
  onSendMessage,
  userId,
  companionId,
  isLoading = false,
  placeholder = "Type your message...",
}: EnhancedChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedMemories, setSelectedMemories] = useState<SimplifiedMemory[]>(
    []
  );
  const [showMemoryTagger, setShowMemoryTagger] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Generate suggested tags when message changes
  useEffect(() => {
    if (message.trim()) {
      const tags = suggestRelevantMemoryTags(message);
      setSuggestedTags(tags);
    } else {
      setSuggestedTags([]);
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() || isLoading) return;

    onSendMessage(message.trim(), selectedMemories);
    setMessage("");
    setSelectedMemories([]);
    setSuggestedTags([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeMemory = (memoryId: string) => {
    setSelectedMemories((prev) => prev.filter((m) => m.id !== memoryId));
  };

  const handleMemorySelect = (memories: SimplifiedMemory[]) => {
    setSelectedMemories(memories);
  };

  return (
    <div className="space-y-4">
      {/* Selected Memories Display */}
      <AnimatePresence>
        {selectedMemories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">
                    Tagged Memories ({selectedMemories.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedMemories.map((memory) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 p-2 bg-white rounded-lg border border-purple-100"
                    >
                      <div className="flex-1">
                        <p className="text-xs text-gray-800 line-clamp-2">
                          {memory.content}
                        </p>
                        {memory.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {memory.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs h-4"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMemory(memory.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggested Tags */}
      <AnimatePresence>
        {suggestedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-2"
          >
            <span className="text-xs text-gray-500 self-center">
              Suggested memory tags:
            </span>
            {suggestedTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-purple-50 hover:border-purple-300"
                onClick={() => setShowMemoryTagger(true)}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <Card className="border-2 border-gray-200 focus-within:border-purple-400 transition-colors">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className="min-h-[80px] max-h-[200px] resize-none border-0 p-0 focus-visible:ring-0 text-base"
              style={{ height: "auto" }}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Memory Tagger Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMemoryTagger(true)}
                  className="flex items-center gap-2 text-purple-600 border-purple-300 hover:bg-purple-50"
                  disabled={isLoading}
                >
                  <Brain className="h-4 w-4" />
                  <span className="hidden sm:inline">Tag Memories</span>
                  {selectedMemories.length > 0 && (
                    <Badge variant="secondary" className="h-5 text-xs">
                      {selectedMemories.length}
                    </Badge>
                  )}
                </Button>

                {/* Quick AI Enhancement Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                  disabled={isLoading}
                  onClick={() => {
                    // Add AI enhancement suggestions here
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Enhance</span>
                </Button>
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isLoading ? "Sending..." : "Send"}
                </span>
              </Button>
            </div>

            {/* Character Count & Quick Stats */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>{message.length} characters</span>
                {selectedMemories.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    {selectedMemories.length} memories tagged
                  </span>
                )}
              </div>
              <div className="text-gray-400">
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Memory Tagger Modal */}
      <MemoryTagger
        userId={userId}
        companionId={companionId}
        onMemorySelect={handleMemorySelect}
        isOpen={showMemoryTagger}
        onClose={() => setShowMemoryTagger(false)}
      />
    </div>
  );
}
