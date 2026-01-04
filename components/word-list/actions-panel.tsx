import React, { startTransition, useActionState } from "react";
import { WordWithMeanings } from "../add-word/add-word-form";
import { Row } from "@tanstack/react-table";
import { initialActionState } from "@/lib/constants/initial-values";
import { deleteWords } from "@/lib/actions/word.actions";
import { Button } from "../ui/button";
import ConfirmActionDialog from "../shared/confirm-action-dialog";

type Props = {
  selectedRows: Row<WordWithMeanings>[];
};

const ActionsPanel = ({ selectedRows }: Props) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [state, formAction, isLoading] = useActionState(
    deleteWords,
    initialActionState
  );

  const handleDelete = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    selectedRows
      .map((row) => row.original.id)
      .forEach((id) => {
        formData.append("ids", id);
      });
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <ConfirmActionDialog
      showDialog={showDeleteDialog}
      setShowDialog={setShowDeleteDialog}
      handleDelete={handleDelete}
      message={state?.message || ""}
      isLoading={isLoading}
      title="Delete word"
      triggerButton={
        <Button
          type="button"
          size={"sm"}
          variant={"destructive"}
          className="text-white"
        >
          Delete
        </Button>
      }
      actionText="Delete"
    >
      <p>Are you sure you want to delete selected words?</p>
    </ConfirmActionDialog>
  );
};

export default ActionsPanel;
