"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  deleteWords,
  bulkUpdateMasteryLevel,
} from "@/lib/actions/word.actions";
import { MasteryLevel } from "@/lib/constants/enums";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

type Props = {
  selectedIds: Set<string>;
  onUpdateSuccess: () => void;
  isPending?: boolean;
  startTransition?: (callback: () => void) => void;
};

const ActionsPanel = ({
  selectedIds,
  onUpdateSuccess,
  isPending = false,
  startTransition = () => {},
}: Props) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    startTransition(async () => {
      const formData = new FormData();
      selectedIds.forEach((id) => {
        formData.append("ids", id);
      });

      const result = await deleteWords({}, formData);
      if (result && result.success) {
        onUpdateSuccess();
        setDeleteConfirmOpen(false);
      }
    });
  };

  const handleBulkMarkAs = async (level: MasteryLevel) => {
    if (selectedIds.size === 0) return;

    startTransition(async () => {
      const formData = new FormData();
      selectedIds.forEach((id) => {
        formData.append("ids", id);
      });
      formData.append("masteryLevel", level);

      const result = await bulkUpdateMasteryLevel({}, formData);
      if (result && result.success) {
        onUpdateSuccess();
      }
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-40">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="text-sm font-medium">
          {selectedIds.size} word{selectedIds.size > 1 ? "s" : ""} selected
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkMarkAs(MasteryLevel.New)}
            disabled={isPending}
          >
            Mark as New
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkMarkAs(MasteryLevel.Learning)}
            disabled={isPending}
          >
            Mark as Learning
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkMarkAs(MasteryLevel.Familiar)}
            disabled={isPending}
          >
            Mark as Familiar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkMarkAs(MasteryLevel.Mastered)}
            disabled={isPending}
          >
            Mark as Mastered
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Words</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedIds.size} word
              {selectedIds.size > 1 ? "s" : ""}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActionsPanel;
