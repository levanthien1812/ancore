import React from "react";
import { WordWithMeanings } from "../add-word/add-word-form";
import WordDetail from "../word-card/word-detail";
import { useCarousel } from "../ui/carousel";
import { Button } from "../ui/button";
import { ChevronsRight } from "lucide-react";

const BackFace = ({ word }: { word: WordWithMeanings }) => {
  const { scrollNext, canScrollNext } = useCarousel();

  return (
    <div className="h-full flex flex-col justify-center">
      <WordDetail word={word} />
      <div className="absolute bottom-4 right-4">
        {canScrollNext && (
          <Button
            onClick={() => scrollNext()}
            className="border-2 border-white bg-transparent ms-auto"
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
