"use client";
import React from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import AddWordForm, { WordWithMeanings } from "../add-word/add-word-form";
import AddWord from "../add-word/add-word";

const WordActions = ({ word }: { word: WordWithMeanings }) => {
  const [isEditing, setIsEditing] = React.useState(false);

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

      <Button size={"sm"} variant={"secondary"} className="text-destructive">
        Delete
      </Button>
    </div>
  );
};

export default WordActions;
