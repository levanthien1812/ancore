"use client";
import { WordWithMeanings } from "../add-word/add-word-form";
import WordDetail from "../word-card/word-detail";
import { useCarousel } from "../ui/carousel";
import { Button } from "../ui/button";
import { ChevronsRight, ChevronsLeft } from "lucide-react";

const BackFace = ({ word }: { word: WordWithMeanings }) => {
  const { scrollNext, canScrollNext, scrollPrev, canScrollPrev } =
    useCarousel();

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="my-auto">
        <WordDetail word={word} showReviewStats={false} />
      </div>
      <div className="flex gap-2">
        {canScrollPrev && (
          <Button
            onClick={() => scrollPrev()}
            className="border border-white bg-transparent hover:bg-white/10 flex-1"
          >
            <ChevronsLeft width={14} height={14} className="text-primary-2" />{" "}
            Prev Word
          </Button>
        )}
        {canScrollNext && (
          <Button
            onClick={() => scrollNext()}
            className="border border-white bg-transparent hover:bg-white/10 flex-1"
          >
            Next Word{" "}
            <ChevronsRight width={14} height={14} className="text-primary-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default BackFace;
