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

interface WordSuggestProps {
  enteredWord: string;
  setEnteredWord: (value: string) => void;
  existingWord?: string;
}

const WordSuggest = ({
  enteredWord,
  setEnteredWord,
  existingWord,
}: WordSuggestProps) => {
  const [suggestedWordList, setSuggestedWordList] = useState<string[]>([]);
  const [isChosen, setIsChosen] = useState(existingWord ? true : false);

  const handleSuggest = async (value: string) => {
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
      debouncedSuggest(value);
    } else {
      setSuggestedWordList([]);
    }
  };

  const handleWordSelect = (word: string) => {
    setEnteredWord(word);
    setSuggestedWordList([]);
    setIsChosen(true);
  };

  return (
    <Command className="w-full">
      <CommandInput
        placeholder="Type a word"
        value={enteredWord}
        onValueChange={handleWordChange}
      />
      {enteredWord.trim().length > 0 && (
        <CommandList>
          {!isChosen && <CommandEmpty>No word found</CommandEmpty>}
          <CommandGroup heading="Suggestions">
            {suggestedWordList
              .filter((item) =>
                item.toLowerCase().includes(enteredWord.toLowerCase())
              )
              .map((word) => (
                <CommandItem
                  key={word}
                  className="text-blue"
                  onSelect={handleWordSelect}
                >
                  {word}
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      )}
    </Command>
  );
};

export default WordSuggest;
