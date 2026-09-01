"use client";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import { WordWithMeanings } from "../add-word/add-word-form";
import { useLayoutStore } from "@/lib/stores/layout-store";
import { OverflowText } from "./overflow-text";

interface WordTitleProps {
  word: WordWithMeanings;
  onClick: () => void;
  disabled?: boolean;
}

const WordTitle = ({ word, onClick, disabled }: WordTitleProps) => {
  const { mode } = useLayoutStore();

  return (
    <button
      type="button"
      disabled={disabled}
      className={`flex-1 min-w-0 w-full cursor-pointer ${mode === "list" ? "text-primary" : "text-white"} group outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md transition text-left ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      onClick={onClick}
    >
      <div className="flex gap-1 items-center min-w-0 w-full">
        <OverflowText
          className="font-bold text-2xl leading-tight hover:underline group-hover:text-shadow-md"
          title={`${word.word} ${word.meanings[0]?.usageNotes ? `- ${word.meanings[0].usageNotes}` : ""}`}
        >
          {word.word}
        </OverflowText>
        <SquareArrowOutUpRightIcon
          width={14}
          height={14}
          className="hidden sm:group-hover:block"
          color={mode === "list" ? "#3b82f6" : "#fff"}
        />
      </div>
    </button>
  );
};

export default WordTitle;
