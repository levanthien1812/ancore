"use client";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import WordDetailDialog from "./word-detail";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WordWithMeanings } from "../add-word/add-word-form";
import { useCallback, useEffect } from "react";

export type WordDialogProps = {
  word: WordWithMeanings | null;
  selectedIndex?: number | null;
  setSelectedIndex?: (index: number | null) => void;
  totalWord?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const WordDialog = ({
  word,
  selectedIndex = null,
  setSelectedIndex,
  totalWord = 0,
  open,
  onOpenChange,
}: WordDialogProps) => {
  const isOpen =
    open !== undefined
      ? open
      : selectedIndex !== null && selectedIndex !== undefined;

  const handleClose = useCallback(() => {
    onOpenChange?.(false);
    setSelectedIndex?.(null);
  }, [onOpenChange, setSelectedIndex]);

  const handlePrevious = useCallback(() => {
    if (
      selectedIndex !== null &&
      selectedIndex !== undefined &&
      selectedIndex > 0 &&
      setSelectedIndex
    ) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex, setSelectedIndex]);

  const handleNext = useCallback(() => {
    if (
      selectedIndex !== null &&
      selectedIndex !== undefined &&
      selectedIndex < totalWord - 1 &&
      setSelectedIndex
    ) {
      setSelectedIndex(selectedIndex + 1);
    }
  }, [selectedIndex, setSelectedIndex, totalWord]);

  const hasNavigation =
    totalWord > 1 &&
    selectedIndex !== null &&
    selectedIndex !== undefined &&
    setSelectedIndex !== undefined;

  useEffect(() => {
    if (!isOpen || !hasNavigation) return;

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
  }, [isOpen, hasNavigation, handleNext, handlePrevious]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {word && (
        <DialogContent className="bg-primary">
          <DialogTitle className="text-white">Word details</DialogTitle>
          <WordDetailDialog word={word} />
          <DialogFooter>
            <Button
              onClick={handleClose}
              className={hasNavigation ? "hidden md:block" : "w-full sm:w-auto"}
            >
              Close
            </Button>
            {hasNavigation && (
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
            )}
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default WordDialog;
