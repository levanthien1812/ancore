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
  return (
    <Dialog>
      <DialogTrigger>Add word</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new word</DialogTitle>
          <DialogDescription>
            Add a new word to your vocabulary list. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <AddWordForm />
      </DialogContent>
    </Dialog>
  );
};

export default AddWord;
