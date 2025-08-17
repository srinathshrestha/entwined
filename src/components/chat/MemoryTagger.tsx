"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Tag, X, Search, Clock, Star } from "lucide-react";
import { SimplifiedMemory } from "@/types";

interface MemoryTaggerProps {
  userId: string;
  companionId: string;
  onMemorySelect: (memories: SimplifiedMemory[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function MemoryTagger({
  userId,
  companionId,
  onMemorySelect,
  isOpen,
  onClose,
}: MemoryTaggerProps) {
  const [memories, setMemories] = useState<SimplifiedMemory[]>([]);
  const [selectedMemories, setSelectedMemories] = useState<SimplifiedMemory[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch memories when component opens
  useEffect(() => {
    if (isOpen) {
      fetchMemories();
    }
  }, [isOpen, userId, companionId]);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/memories?userId=${userId}&companionId=${companionId}`
      );
      if (response.ok) {
        const data = await response.json();
        setMemories(data.memories || []);

        // Extract unique tags from all memories
        const allTags =
          data.memories?.flatMap((m: SimplifiedMemory) => m.tags) || [];
        const uniqueTags = [...new Set(allTags)];
        setAvailableTags(uniqueTags);
      }
    } catch (error) {
      console.error("Error fetching memories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter memories based on search and tags
  const filteredMemories = memories.filter((memory) => {
    const matchesSearch =
      searchQuery.toLowerCase() === "" ||
      memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memory.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => memory.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const toggleMemorySelection = (memory: SimplifiedMemory) => {
    setSelectedMemories((prev) => {
      const isSelected = prev.some((m) => m.id === memory.id);
      if (isSelected) {
        return prev.filter((m) => m.id !== memory.id);
      } else {
        return [...prev, memory];
      }
    });
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleApplyMemories = () => {
    onMemorySelect(selectedMemories);
    onClose();
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return "text-red-500";
    if (importance >= 6) return "text-yellow-500";
    return "text-gray-500";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-purple-600" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Tag Relevant Memories
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select memories to provide context for your message
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search memories by content or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tag Filters */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Filter by tags:
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        selectedTags.includes(tag) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleTagFilter(tag)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Memory List */}
          <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading memories...</p>
              </div>
            ) : filteredMemories.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No memories found</p>
                <p className="text-sm text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMemories.map((memory) => {
                  const isSelected = selectedMemories.some(
                    (m) => m.id === memory.id
                  );
                  return (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? "ring-2 ring-purple-500 bg-purple-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => toggleMemorySelection(memory)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <p className="text-sm text-gray-900">
                                {memory.content}
                              </p>

                              {/* Tags */}
                              {memory.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {memory.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Metadata */}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(
                                    memory.createdAt
                                  ).toLocaleDateString()}
                                </div>
                                <div
                                  className={`flex items-center gap-1 ${getImportanceColor(
                                    memory.importance
                                  )}`}
                                >
                                  <Star className="h-3 w-3" />
                                  {memory.importance}/10
                                </div>
                                {memory.userCreated && (
                                  <Badge variant="outline" className="text-xs">
                                    User Created
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedMemories.length} memories selected
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyMemories}
                  disabled={selectedMemories.length === 0}
                >
                  Apply Selected Memories
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
