"use client";
import React from "react";
import AddWordForm, { WordWithMeanings } from "./add-word-form";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { WordOfTheDay } from "../home/word-of-the-day";
import { PlusIcon } from "lucide-react";

type AddWordProps = {
  word?: WordWithMeanings;
  triggerButton?: React.ReactNode;
  wordOfTheDay?: WordOfTheDay;
};

const AddWord = ({ word, triggerButton, wordOfTheDay }: AddWordProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const defaultTriggerBtn = (
    <Button
      className="bg-primary-2 px-4 py-1 text-primary font-bold hover:bg-primary-2/90"
      onClick={(e) => e.stopPropagation()}
    >
      <PlusIcon width={18} height={18} className="" />
      <span className="hidden sm:block">{word ? "Edit word" : "Add word"}</span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTriggerBtn}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{word ? "Edit word" : "Add new word"}</DialogTitle>
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
