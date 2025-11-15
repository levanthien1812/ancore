"use client";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import React, { useState } from "react";
import { WordWithMeanings } from "../add-word/add-word-form";

interface WordTitleProps {
  word: WordWithMeanings;
  onClick: () => void;
}

const WordTitle = ({ word, onClick }: WordTitleProps) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="font-bold text-xl text-primary flex gap-1 items-center cursor-pointer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {word.word}{" "}
      {hover && <SquareArrowOutUpRightIcon width={14} height={14} />}
    </div>
  );
};

export default WordTitle;
