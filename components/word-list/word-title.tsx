"use client";
import { SquareArrowOutUpRightIcon } from "lucide-react";
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
      className={`min-w-0 cursor-pointer ${mode === "list" ? "text-primary" : "text-white"} group outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md transition text-left ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      onClick={onClick}
    >
      <div className="flex gap-1 items-center min-w-0">
        <p
          className="flex-1 min-w-0 font-bold text-2xl leading-tight hover:underline truncate max-w-full"
          title={`${word.word} ${word.meanings[0]?.usageNotes ? `- ${word.meanings[0].usageNotes}` : ""}`}
        >
          {word.word}
        </p>
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
