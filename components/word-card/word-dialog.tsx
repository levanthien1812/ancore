"use client";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import WordDetailDialog from "./word-detail";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WordWithMeanings } from "../add-word/add-word-form";

const WordDialog = ({
  word,
  selectedIndex,
  setSelectedIndex,
  totalWord,
}: {
  word: WordWithMeanings | null;
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
  totalWord: number;
}) => {
  if (!word || selectedIndex === null) return null;

  const handleClose = () => {
    setSelectedIndex(null);
  };

  const handlePrevious = () => {
    setSelectedIndex(selectedIndex - 1);
  };

  const handleNext = () => {
    setSelectedIndex(selectedIndex + 1);
  };

  return (
    <Dialog open={selectedIndex !== null} onOpenChange={handleClose}>
      {word && (
        <DialogContent className="bg-primary">
          <DialogTitle className="text-white">Word details</DialogTitle>
          <WordDetailDialog word={word} />
          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
            <Button
              variant={"outline"}
              onClick={handlePrevious}
              disabled={selectedIndex === 0}
            >
              <ChevronLeft /> Previous
            </Button>
            <Button
              variant={"outline"}
              onClick={handleNext}
              disabled={selectedIndex === totalWord - 1}
            >
              Next <ChevronRight />
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default WordDialog;
