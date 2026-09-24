"use client";
import { useState } from "react";
import { WordWithMeanings } from "../add-word/add-word-form";
import { Dot, Volume2Icon } from "lucide-react";
import WordTitle from "./word-title";
import WordDefinition from "./word-definition";
import WordMasteryLevel from "./word-mastery-level";
import { MasteryLevel } from "@/lib/constants/enums";
import { formatPronunciation } from "@/lib/utils/pronunciation";
import IconDisplay from "../shared/icon-display";
import { handlePlayPronunciation } from "@/lib/utils/handlePlayAudio";
import PartsOfSpeech from "./parts-of-speech";
import { Badge } from "../ui/badge";

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
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleCardClick = () => {
    if (isSelectMode) {
      onSelect?.(word.id);
    } else {
      onClickTitle();
    }
  };

  const currentMeaning = word.meanings[currentIndex] ?? word.meanings[0];

  const currentPos =
    currentMeaning?.partOfSpeech && currentMeaning.partOfSpeech.length > 0
      ? [currentMeaning.partOfSpeech]
      : word.type
        ? [word.type as string]
        : [];

  const currentCefrLevel =
    currentMeaning?.cefrLevel && currentMeaning.cefrLevel.length > 0
      ? currentMeaning.cefrLevel
      : null;

  const currentPronunciation =
    currentMeaning?.pronunciation || word.meanings[0]?.pronunciation;

  return (
    <div
      className={`p-3 sm:p-4 rounded-lg shadow-sm shadow-primary bg-primary group relative transition-colors duration-200 md:hover:shadow-md md:hover:bg-primary-2 md:hover:shadow-primary-2 ${
        isSelectMode ? "cursor-pointer" : ""
      } ${isSelected ? "bg-primary-2 shadow-primary-2" : ""}`}
      onClick={isSelectMode ? handleCardClick : undefined}
    >
      <div className="flex gap-2 items-start">
        <div className="flex flex-col flex-1 items-start overflow-hidden">
          <div className="flex gap-1 items-center w-full min-w-0">
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
            <IconDisplay
              icon={Volume2Icon}
              asButton
              size="sm"
              onClick={() => handlePlayPronunciation(word.word)}
            />
            {word.highlighted && <div className="ms-auto">⭐</div>}
            <WordMasteryLevel
              level={word.masteryLevel as MasteryLevel}
              wordId={word.id}
            />
          </div>
          <div className="flex items-center">
            <p className="text-sm text-white">
              {formatPronunciation(currentPronunciation)}
            </p>
            {currentPronunciation && currentPos.length > 0 && (
              <Dot width={16} height={16} color="white" opacity={0.5} />
            )}
            {currentPos.length > 0 && (
              <PartsOfSpeech
                uniquePos={currentPos}
                wordType={word.type as string}
              />
            )}
            {currentPos.length > 0 && currentCefrLevel && (
              <Dot width={16} height={16} color="white" opacity={0.5} />
            )}
            {currentCefrLevel && (
              <Badge className="bg-primary-2 text-primary text-[10px] font-bold py-0 px-1 rounded-sm group-hover:bg-primary group-hover:text-white">
                {currentCefrLevel}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <WordDefinition
          meanings={word.meanings.map((meaning) => meaning.definition)}
          wordIndex={currentIndex}
        />
        {word.meanings.length > 1 && (
          <div className="flex items-center gap-1.5 mt-2">
            {word.meanings.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 cursor-pointer focus:outline-none ${
                  index === currentIndex
                    ? "bg-white scale-125"
                    : "bg-white/40 hover:bg-white/70"
                }`}
                title={`Meaning ${index + 1}`}
                aria-label={`View meaning ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordCard;
