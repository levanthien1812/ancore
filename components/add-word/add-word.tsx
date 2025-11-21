"use client";
import React from "react";
import AddWordForm, { WordWithMeanings } from "./add-word-form";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { WordOfTheDay } from "../home/word-of-the-day";

type AddWordProps = {
  word?: WordWithMeanings;
  triggerButton?: React.ReactNode;
  wordOfTheDay?: WordOfTheDay;
};

const AddWord = ({ word, triggerButton, wordOfTheDay }: AddWordProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            className="bg-primary-2 rounded-full px-4 py-1 text-primary font-bold hover:bg-primary-2/90"
            onClick={(e) => e.stopPropagation()}
          >
            {word ? "Edit word" : "Add word"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{word ? "Edit word" : "Add new word"}</DialogTitle>
          {!word && (
            <DialogDescription>
              Add a new word to your vocabulary list. Fill in the details below.
            </DialogDescription>
          )}
        </DialogHeader>
        <AddWordForm
          onClose={() => setIsOpen(false)}
          word={word}
          wordOfTheDay={wordOfTheDay}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddWord;
