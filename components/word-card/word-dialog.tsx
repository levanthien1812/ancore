"use client";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import WordDetailDialog from "./word-detail";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WordWithMeanings } from "../add-word/add-word-form";
import { useCallback, useEffect } from "react";

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
  const handlePrevious = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex, setSelectedIndex]);

  const handleNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < totalWord - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  }, [selectedIndex, setSelectedIndex, totalWord]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      }
      if (e.key === "ArrowRight") {
        handleNext();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handleNext, handlePrevious]);

  const handleClose = () => {
    setSelectedIndex(null);
  };

  return (
    <Dialog open={selectedIndex !== null} onOpenChange={handleClose}>
      {word && (
        <DialogContent className="bg-primary">
          <DialogTitle className="text-white">Word details</DialogTitle>
          <WordDetailDialog word={word} />
          <DialogFooter>
            <Button onClick={handleClose} className="hidden md:block">
              Close
            </Button>
            <div className="flex gap-2 items-center">
              <Button
                variant={"outline"}
                onClick={handlePrevious}
                disabled={selectedIndex === 0}
                className="flex-1 hover:border-primary-2"
              >
                <ChevronLeft /> Previous
              </Button>
              <Button
                variant={"outline"}
                onClick={handleNext}
                disabled={selectedIndex === totalWord - 1}
                className="flex-1 hover:border-primary-2"
              >
                Next <ChevronRight />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default WordDialog;
