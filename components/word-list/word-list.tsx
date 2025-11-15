"use client";
import React from "react";
import { WordWithMeanings } from "../add-word/add-word-form";
import WordTable from "./word-table";
import WordDialog from "../word-card/word-dialog";

const WordList = ({ words }: { words: WordWithMeanings[] }) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const word = selectedIndex !== null ? words[selectedIndex] : undefined;

  const handleTitleClick = React.useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  return (
    <div>
      <WordTable words={words} onClickTitle={handleTitleClick} />
      {word && (
        <WordDialog
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          totalWord={words.length}
          word={word}
        />
      )}
    </div>
  );
};

export default WordList;
