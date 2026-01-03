"use client";
import React, {
  startTransition,
  useActionState,
  useEffect,
  useEffectEvent,
} from "react";
import { Button } from "../ui/button";
import { WordWithMeanings } from "../add-word/add-word-form";
import AddWord from "../add-word/add-word";
import { deleteWords } from "@/lib/actions/word.actions";
import { initialActionState } from "@/lib/constants/initial-values";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmActionDialog from "../shared/confirm-action-dialog";

const WordActions = ({ word }: { word: WordWithMeanings }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const queryClient = useQueryClient();

  const [state, formAction, isLoading] = useActionState(
    deleteWords,
    initialActionState
  );

  const onDeleteSuccess = useEffectEvent(() => {
    setShowDeleteDialog(false);
    queryClient.invalidateQueries({ queryKey: ["words"] });
  });

  useEffect(() => {
    if (state.success) {
      onDeleteSuccess();
    }
  }, [state.success]);

  const handleDelete = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="flex gap-1">
      <AddWord
        word={word}
        triggerButton={
          <Button
            size={"sm"}
            variant={"secondary"}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        }
      />

      <ConfirmActionDialog
        showDialog={showDeleteDialog}
        setShowDialog={setShowDeleteDialog}
        handleDelete={handleDelete}
        message={state.message}
        isLoading={isLoading}
        title="Delete word"
        triggerButton={
          <Button
            type="button"
            size={"sm"}
            variant={"secondary"}
            className="text-destructive"
          >
            Delete
          </Button>
        }
        actionText="Delete"
      >
        <p>Are you sure you want to delete this word?</p>
        <input type="hidden" name="ids" value={word.id} />
      </ConfirmActionDialog>
    </div>
  );
};

export default WordActions;
