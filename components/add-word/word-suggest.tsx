"use client";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { debounce } from "@/lib/utils/debounce";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface WordSuggestProps {
  enteredWord: string;
  setEnteredWord: (value: string) => void;
  existingWord?: string;
  entryType?: "word" | "phrase";
}

const WordSuggest = ({
  enteredWord,
  setEnteredWord,
  existingWord,
  entryType = "word",
}: WordSuggestProps) => {
  const [suggestedWordList, setSuggestedWordList] = useState<string[]>([]);
  const [isChosen, setIsChosen] = useState(existingWord ? true : false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSuggest = async (value: string) => {
    if (entryType === "phrase") {
      return;
    }
    const response = await fetch(`/api/datamuse?w=${value}`);
    if (response.ok) {
      const data = await response.json();
      setSuggestedWordList(data);
    } else {
      setSuggestedWordList([]);
    }
  };

  const debouncedSuggest = debounce(handleSuggest, 500);

  const handleWordChange = async (value: string) => {
    setEnteredWord(value);
    setIsChosen(false);
    if (value.trim().length > 0) {
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
    setIsChosen(true);
    setShowSuggestions(false);
  };

  return (
    <div className="relative flex-1">
      <Label htmlFor="word" className="text-right">
        Word
      </Label>
      <Input
        placeholder={entryType === "phrase" ? "Type a phrase" : "Type a word"}
        value={enteredWord}
        onChange={(e) => handleWordChange(e.target.value)}
        className="mt-1"
      />
      {showSuggestions && (
        <div className="absolute w-full top-14 left-0 bg-white border p-2 rounded-md">
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
};

export default WordSuggest;
