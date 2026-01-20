"use client";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import React, { useState } from "react";
import { WordWithMeanings } from "../add-word/add-word-form";

interface WordTitleProps {
  word: WordWithMeanings;
  onClick: () => void;
}

const WordTitle = ({ word, onClick }: WordTitleProps) => {
  return (
    <div className="cursor-pointer text-primary group" onClick={onClick}>
      <div className="flex gap-1 items-center">
        <span className="font-bold text-xl leading-none">{word.word}</span>
        <SquareArrowOutUpRightIcon
          width={14}
          height={14}
          className="hidden group-hover:block"
        />
      </div>
      <div className="mt-1 text-gray-600 text-sm">
        {word.meanings[0]?.usageNotes}
      </div>
    </div>
  );
};

export default WordTitle;
