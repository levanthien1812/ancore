"use client";
import React from "react";
import AddOrEditWordForm, { WordWithMeanings } from "./add-word-form";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { WordOfTheDay } from "../home/word-of-the-day";
import { PlusIcon } from "lucide-react";
import { Button } from "../ui/button";

type AddOrEditWordProps = {
  word?: WordWithMeanings;
  triggerButton?: React.ReactNode | null;
  wordOfTheDay?: WordOfTheDay;
  initialWord?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const AddOrEditWord = ({
  word,
  triggerButton,
  wordOfTheDay,
  initialWord,
  open: controlledOpen,
  onOpenChange,
}: AddOrEditWordProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const defaultTriggerBtn = (
    <Button
      className="text-primary font-bold"
      onClick={(e) => e.stopPropagation()}
      variant={"default2"}
    >
      <PlusIcon width={18} height={18} className="" />
      <span className="hidden sm:block">{word ? "Edit word" : "Add word"}</span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {triggerButton !== null && !initialWord && (
        <DialogTrigger asChild>
          {triggerButton || defaultTriggerBtn}
        </DialogTrigger>
      )}
      <DialogContent
        className="sm:max-w-4xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{word ? "Edit word" : "Add new word"}</DialogTitle>
        </DialogHeader>
        <AddOrEditWordForm
          onClose={() => setIsOpen(false)}
          word={word}
          wordOfTheDay={wordOfTheDay}
          initialWord={initialWord}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddOrEditWord;
