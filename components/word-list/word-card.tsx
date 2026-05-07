import { WordWithMeanings } from "../add-word/add-word-form";
import { Dot, Volume2Icon } from "lucide-react";
import WordTitle from "./word-title";
import WordDefinition from "./word-definition";
import WordMasteryLevel from "./word-mastery-level";
import { MasteryLevel } from "@/lib/constants/enums";
import { formatPronunciation } from "@/lib/utils/pronunciation";
import IconDisplay from "../shared/icon-display";
import { handlePlayAudio } from "@/lib/utils/handlePlayAudio";
import { WordType } from "@prisma/client";

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
      <div className="flex gap-2 items-start">
        <div className="flex flex-col flex-1 items-start overflow-hidden">
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
            <IconDisplay
              icon={Volume2Icon}
              asButton
              size="sm"
              onClick={(e) => handlePlayAudio(word.word)}
            />
          </div>
          <div className="flex items-center">
            <p className="text-sm text-white">
              {formatPronunciation(word.meanings[0]?.pronunciation)}
            </p>
            {word.meanings[0]?.partOfSpeech &&
              word.meanings[0].pronunciation && (
                <Dot width={16} height={16} color="white" opacity={0.5} />
              )}
            <p className="font-bold text-sm text-blue-300">
              {word.type === WordType.Word
                ? word.meanings[0].partOfSpeech
                : word.type}
            </p>
          </div>
        </div>
        <div></div>
        <div className="flex gap-1 items-center">
          {word.highlighted && <div className="ms-auto">⭐</div>}
          <WordMasteryLevel
            level={word.masteryLevel as MasteryLevel}
            wordId={word.id}
          />
        </div>
      </div>

      <div className="mt-2">
        <WordDefinition
          meanings={word.meanings.map((meaning) => meaning.definition)}
        />
      </div>
    </div>
  );
};

export default WordCard;
