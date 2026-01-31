"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Note } from "@prisma/client";

interface NoteDetailModalProps {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NoteDetailModal = ({
  note,
  open,
  onOpenChange,
}: NoteDetailModalProps) => {
  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{note.title || "Untitled"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg border border-border">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: note.content || "" }}
            />
          </div>
          {note.tags && (
            <div className="flex flex-wrap gap-2">
              {note.tags.split(",").map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoteDetailModal;
