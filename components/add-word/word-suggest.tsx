"use client";
import { useCallback, useMemo, useState, memo, useRef, useEffect } from "react";
import { debounce } from "@/lib/utils/debounce";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { WordType } from "@prisma/client";

interface WordSuggestProps {
  enteredWord: string;
  setEnteredWord: (value: string) => void;
  existingWord?: string;
  entryType?: WordType;
  onPaste?: (e: React.ClipboardEvent) => void;
}

const WordSuggest = memo(function WordSuggest({
  enteredWord,
  setEnteredWord,
  existingWord,
  entryType = WordType.Word,
  onPaste,
}: WordSuggestProps) {
  const [suggestedWordList, setSuggestedWordList] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggest = useCallback(
    async (value: string) => {
      if (entryType === WordType.Phrase) {
        return;
      }
      try {
        const response = await fetch(`/api/datamuse?w=${value}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestedWordList(data);
        } else {
          setSuggestedWordList([]);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestedWordList([]);
      }
    },
    [entryType],
  );

  const debouncedSuggest = useMemo(
    () => debounce(handleSuggest, 500),
    [handleSuggest],
  );

  const handleWordChange = async (value: string) => {
    setEnteredWord(value);
    if (value.trim().length > 0 && entryType === WordType.Word) {
      setShowSuggestions(true);
      debouncedSuggest(value);
    } else {
      setSuggestedWordList([]);
      setShowSuggestions(false);
    }
  };

  const handleWordSelect = (word: string) => {
    setEnteredWord(word);
    setSuggestedWordList([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      <Label htmlFor="word" className="text-right">
        Word
      </Label>
      <Input
        placeholder={
          entryType === WordType.Phrase ? "Type a phrase" : "Type a word"
        }
        value={enteredWord}
        onChange={(e) => handleWordChange(e.target.value)}
        className="mt-1"
        onPaste={onPaste}
      />
      {showSuggestions && entryType === WordType.Word && (
        <div className="absolute w-full top-14 left-0 bg-white border p-2 rounded-md z-20">
          <p className="text-gray-600 text-xs ">Suggestions</p>
          {suggestedWordList.length === 0 && (
            <p className="text-center text-muted-foreground">No word found</p>
          )}
          <div className="flex flex-col max-h-[200px] custom-scrollbar-y mt-1">
            {suggestedWordList
              .filter((item) =>
                item.toLowerCase().includes(enteredWord.toLowerCase()),
              )
              .map((word) => (
                <button
                  key={word}
                  className="text-blue w-full cursor-pointer hover:bg-gray-50 text-start py-1 px-2 rounded-sm"
                  onClick={() => handleWordSelect(word)}
                >
                  {word}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default WordSuggest;
