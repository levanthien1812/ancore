"use client";
import React from "react";
import AddWordForm from "./add-word-form";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

const AddWord = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="bg-primary-2 rounded-full px-4 py-1 text-primary font-bold">
        Add word
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new word</DialogTitle>
          <DialogDescription>
            Add a new word to your vocabulary list. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <AddWordForm onClose={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default AddWord;
