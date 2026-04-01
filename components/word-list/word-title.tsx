"use client";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import React, { useState } from "react";
import { WordWithMeanings } from "../add-word/add-word-form";
import { useLayout } from "../layout/layout-context";

interface WordTitleProps {
  word: WordWithMeanings;
  onClick: () => void;
}

const WordTitle = ({ word, onClick }: WordTitleProps) => {
  const { mode } = useLayout();

  return (
    <div
      className={`cursor-pointer ${mode === "list" ? "text-primary" : "text-white"} group`}
      onClick={onClick}
    >
      <div className="flex gap-1 items-center">
        <p className={`font-bold text-2xl leading-none hover:underline`}>
          {word.word}
        </p>
        <SquareArrowOutUpRightIcon
          width={14}
          height={14}
          className="hidden group-hover:block"
          color={mode === "list" ? "#3b82f6" : "#fff"}
        />
      </div>
      <div
        className={`mt-1 ${mode === "list" ? "text-gray-600" : "text-gray-400"} text-sm`}
      >
        {word.meanings[0]?.usageNotes}
      </div>
    </div>
  );
};

export default WordTitle;
