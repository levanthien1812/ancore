"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNote, toggleHighlightNote } from "@/lib/actions/note.actions";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Star, Eye } from "lucide-react";
import { toast } from "sonner";
import AddNote from "@/components/add-note/add-note";
import ConfirmActionDialog from "@/components/shared/confirm-action-dialog";
import NoteDetailModal from "./note-detail-modal";
import type { Note } from "@prisma/client";

interface NoteCardProps {
  note: Note;
}

const NoteCard = ({ note }: NoteCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();

  const getTextContent = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").trim();
  };

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: (result) => {
      if (result && result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_NOTES] });
        setShowDeleteDialog(false);
      } else if (result) {
        toast.error(result.message);
      }
    },
    onError: () => {
      toast.error("Failed to delete note.");
    },
  });

  const highlightMutation = useMutation({
    mutationFn: toggleHighlightNote,
    onSuccess: (result) => {
      if (result && result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_NOTES] });
      } else if (result) {
        toast.error(result.message);
      }
    },
    onError: () => {
      toast.error("Failed to toggle highlight.");
    },
  });

  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    deleteMutation.mutate(note.id);
  };

  return (
    <>
      <Card
        className={`hover:shadow-md transition-shadow ${
          note.highlighted ? "border-yellow-400 bg-yellow-50" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {note.title || "Untitled"}
            </CardTitle>
            <div
              className={`flex gap-1 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailModal(true);
                }}
                title="View detail"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  highlightMutation.mutate(note.id);
                }}
                className={note.highlighted ? "text-yellow-500" : ""}
                title="Toggle highlight"
              >
                <Star className="h-4 w-4" />
              </Button>
              <AddNote
                note={note}
                triggerButton={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                }
              />
              <ConfirmActionDialog
                showDialog={showDeleteDialog}
                setShowDialog={setShowDeleteDialog}
                handleDelete={handleDelete}
                message={`Are you sure you want to delete "${note.title || "this note"}"? This action cannot be undone.`}
                title="Delete Note"
                triggerButton={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
                actionText="Delete"
                isLoading={deleteMutation.isPending}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="text-sm text-muted-foreground mb-2 prose prose-sm max-w-none line-clamp-3"
            dangerouslySetInnerHTML={{ __html: note.content || "" }}
          />
          {note.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {note.tags.split(",").map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NoteDetailModal
        note={note}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
      />
    </>
  );
};

export default NoteCard;
