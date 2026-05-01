import React from "react";
import { WordWithMeanings } from "../add-word/add-word-form";
import { Ellipsis } from "lucide-react";
import { Popover, PopoverTrigger } from "../ui/popover";
import { PopoverContent } from "@radix-ui/react-popover";
import WordActions from "./word-actions";
import WordTitle from "./word-title";
import WordDefinition from "./word-definition";
import WordPronunciation from "./word-pronunciation";
import WordMasteryLevel from "./word-mastery-level";
import { MasteryLevel } from "@/lib/constants/enums";
import { shorten } from "@/lib/utils/shorten";

const WordCard = ({
  word,
  onClickTitle,
  isSelectMode,
  isSelected,
  onSelect,
}: {
  word: WordWithMeanings;
  onClickTitle: () => void;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (wordId: string) => void;
}) => {
  const handleCardClick = () => {
    if (isSelectMode) {
      onSelect?.(word.id);
    } else {
      onClickTitle();
    }
  };

  return (
    <div
      className={`p-3 sm:p-4 rounded-lg shadow-sm shadow-primary bg-primary group relative transition-colors duration-200 md:hover:shadow-md md:hover:bg-primary-2 md:hover:shadow-primary-2 ${
        isSelectMode ? "cursor-pointer" : ""
      } ${isSelected ? "ring-2 ring-primary-2" : ""}`}
      onClick={isSelectMode ? handleCardClick : undefined}
    >
      <div className="flex gap-2 items-center">
        <div className="flex flex-col flex-1 sm:flex-row gap-1 sm:gap-2 sm:items-center">
          <div className="flex gap-2 items-center">
            {isSelectMode && (
              <div className="flex">
                <input
                  type="checkbox"
                  checked={isSelected || false}
                  onChange={() => onSelect?.(word.id)}
                  className="w-4 h-4 cursor-pointer rounded-full"
                  aria-label={`Select ${word.word}`}
                />
              </div>
            )}

            <WordTitle
              word={word}
              onClick={handleCardClick}
              disabled={isSelectMode}
            />
          </div>
          <WordPronunciation
            word={word.word}
            pronunciation={word.meanings[0]?.pronunciation}
            light={true}
          />
        </div>
        <div className="ms-auto flex gap-2 items-center">
          {word.highlighted && <div className="">⭐</div>}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`block md:hidden md:group-hover:block focus-visible:block cursor-pointer ${
                  isSelectMode ? "hidden" : ""
                }`}
                title="Actions"
              >
                <Ellipsis color="white" width={18} height={18} />
              </button>
            </PopoverTrigger>
            {/* Popover content goes here */}
            <PopoverContent className="p-1 rounded-md bg-white z-20">
              <WordActions word={word} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mt-2">
        <WordDefinition
          meanings={word.meanings.map((meaning) =>
            shorten(meaning.definition, 50),
          )}
        />
      </div>
      <div className="absolute bottom-0 right-0 p-2">
        <WordMasteryLevel
          level={word.masteryLevel as MasteryLevel}
          wordId={word.id}
        />
      </div>
    </div>
  );
};

export default WordCard;
