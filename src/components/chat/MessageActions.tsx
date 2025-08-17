"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MoreVertical,
  Reply,
  Edit,
  Trash2,
  Copy,
  GitBranch,
  MessageSquare,
} from "lucide-react";

interface MessageActionsProps {
  messageId: string;
  messageContent: string;
  messageRole: "user" | "assistant";
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onBranch?: (messageId: string) => void;
  className?: string;
}

export default function MessageActions({
  messageId,
  messageContent,
  messageRole,
  onReply,
  onEdit,
  onDelete,
  onBranch,
  className = "",
}: MessageActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageContent);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(messageId);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
          >
            <MoreVertical className="h-3 w-3" />
            <span className="sr-only">Message options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Reply */}
          {onReply && (
            <DropdownMenuItem onClick={() => onReply(messageId)}>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </DropdownMenuItem>
          )}

          {/* Edit (only for user messages) */}
          {messageRole === "user" && onEdit && (
            <DropdownMenuItem onClick={() => onEdit(messageId)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}

          {/* Branch conversation */}
          {onBranch && (
            <DropdownMenuItem onClick={() => onBranch(messageId)}>
              <GitBranch className="h-4 w-4 mr-2" />
              Branch from here
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Copy */}
          <DropdownMenuItem onClick={handleCopyMessage}>
            <Copy className="h-4 w-4 mr-2" />
            Copy message
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete */}
          {onDelete && (
            <DropdownMenuItem
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
              {messageRole === "user" &&
                " The AI's response to this message will also be removed."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
