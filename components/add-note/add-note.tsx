"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import AddNoteForm from "@/components/add-note/add-note-form";
import { Note } from "@prisma/client";

type AddNoteProps = {
  note?: Note;
  triggerButton?: React.ReactNode;
};

const AddNote = ({ note, triggerButton }: AddNoteProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {triggerButton || (
            <Button
              className="bg-primary-2 rounded-full px-4 py-1 text-primary font-bold hover:bg-primary-2/90"
              onClick={(e) => e.stopPropagation()}
            >
              {note ? "Edit note" : "Add note"}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{note ? "Edit note" : "Add new note"}</DialogTitle>
            {!note && (
              <DialogDescription>
                Add a new note to your vocabulary list. Fill in the details
                below.
              </DialogDescription>
            )}
          </DialogHeader>
          <AddNoteForm note={note} onClose={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddNote;
