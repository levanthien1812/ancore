"use client";
import { useState } from "react";
import { WordWithMeanings } from "../add-word/add-word-form";
import { cn } from "@/lib/utils";
import FrontFace from "./front-face";
import BackFace from "./back-face";

const ReviewWordCard = ({ word }: { word: WordWithMeanings }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="group w-full cursor-pointer perspective-[1000px] h-[800px]">
      <div
        className={cn(
          "relative h-full w-full shadow-xl transition-all duration-500 transform-3d",
          { "transform-[rotateY(180deg)]": isFlipped }
        )}
      >
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden h-full rounded-xl">
          <FrontFace word={word} setIsFlipped={setIsFlipped} />
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 h-full w-full transform-[rotateY(180deg)] backface-hidden bg-primary p-8 rounded-xl">
          <BackFace word={word} />
        </div>
      </div>
    </div>
  );
};

export default ReviewWordCard;
