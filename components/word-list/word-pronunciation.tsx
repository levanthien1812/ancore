"use client";
import { Volume2Icon } from "lucide-react";

const WordPronunciation = ({
  word,
  pronunciation,
  light = false,
}: {
  word: string;
  pronunciation: string | null;
  light?: boolean;
}) => {
  const formattedPronunciation = pronunciation
    ? !pronunciation.includes("/")
      ? `/${pronunciation}/`
      : pronunciation
    : "";

  const handlePlayAudio = () => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex items-center gap-1">
      {pronunciation && (
        <div className={`${light ? "text-white" : "text-gray-600"}`}>
          {formattedPronunciation}
        </div>
      )}
      <button
        type="button"
        onClick={handlePlayAudio}
        className="cursor-pointer"
      >
        <Volume2Icon width={14} height={14} color={light ? "white" : "black"} />
      </button>
    </div>
  );
};

export default WordPronunciation;
