"use client";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import React from "react";
import { WordWithMeanings } from "../add-word/add-word-form";
import { useLayout } from "../layout/layout-context";

interface WordTitleProps {
  word: WordWithMeanings;
  onClick: () => void;
  disabled?: boolean;
}

const WordTitle = ({ word, onClick, disabled }: WordTitleProps) => {
  const { mode } = useLayout();

  return (
    <button
      type="button"
      disabled={disabled}
      className={`cursor-pointer ${mode === "list" ? "text-primary" : "text-white"} group outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md transition text-left ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      onClick={onClick}
    >
      <div className="flex gap-1 items-center">
        <p
          className={`font-bold text-2xl leading-none hover:underline`}
          title={`${word.word} ${word.meanings[0]?.usageNotes ? `- ${word.meanings[0].usageNotes}` : ""}`}
        >
          {word.word}
        </p>
        <SquareArrowOutUpRightIcon
          width={14}
          height={14}
          className="hidden group-hover:block"
          color={mode === "list" ? "#3b82f6" : "#fff"}
        />
      </div>
    </button>
  );
};

export default WordTitle;
