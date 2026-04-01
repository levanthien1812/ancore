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

const WordCard = ({
  word,
  onClickTitle,
}: {
  word: WordWithMeanings;
  onClickTitle: () => void;
}) => {
  return (
    <div className="p-4 rounded-lg shadow-sm shadow-primary hover:shadow-md bg-primary group relative hover:bg-primary-2 hover:shadow-primary-2 transition-colors duration-200">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="absolute group-hover:block hidden top-1 right-1 p-1 cursor-pointer"
            title="Actions"
          >
            <Ellipsis color="white" width={20} height={20} />
          </button>
        </PopoverTrigger>
        {/* Popover content goes here */}
        <PopoverContent className="p-1 rounded-md bg-white z-20">
          <WordActions word={word} />
        </PopoverContent>
      </Popover>
      <div className="flex gap-2 items-start">
        <WordTitle word={word} onClick={onClickTitle} />
        <WordPronunciation
          word={word.word}
          pronunciation={word.meanings[0]?.pronunciation}
          light={true}
        />
        {word.highlighted && (
          <div className="ms-auto">
            <span className="text-center">⭐</span>
          </div>
        )}
      </div>

      <WordDefinition
        meanings={word.meanings.map((meaning) => meaning.definition)}
      />
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
