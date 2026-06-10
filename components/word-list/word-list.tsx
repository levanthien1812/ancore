"use client";
import React, { useEffect } from "react";
import { WordWithMeanings } from "../add-word/add-word-form";
import WordTable from "./word-table";
import WordDialog from "../word-card/word-dialog";
import { LayoutGrid, Rows4 } from "lucide-react";
import WordGrid from "./word-grid";
import { useLayout } from "../layout/layout-context";
import { handlePlayAudio } from "@/lib/utils/handlePlayAudio";

const WordList = ({
  words,
  totalCount,
}: {
  words: WordWithMeanings[];
  totalCount: number;
}) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const word = selectedIndex !== null ? words[selectedIndex] : undefined;
  const { mode, setMode, settings } = useLayout();
  const handleTitleClick = React.useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  useEffect(() => {
    if (selectedIndex !== null && words[selectedIndex]) {
      handlePlayAudio(
        words[selectedIndex].word,
        settings?.autoPlayPronunciation,
      );
    }
  }, [selectedIndex, words, settings?.autoPlayPronunciation]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <p>
            Loaded:{" "}
            <span className="text-primary-2 font-bold text-lg">
              {words.length}
            </span>
          </p>
          <p>
            Total:{" "}
            <span className="text-primary-2 font-bold text-lg">
              {totalCount}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-sm bg-opacity-30">
          <button
            className="cursor-pointer p-1 rounded hover:bg-gray-200 group"
            onClick={() => setMode("list")}
          >
            <Rows4
              width={18}
              height={18}
              color={mode === "list" ? "#3b82f6" : "#000"}
              className={`group-hover:text-primary`}
            />
          </button>
          <button
            className="cursor-pointer p-1 rounded hover:bg-gray-200 group"
            onClick={() => setMode("grid")}
          >
            <LayoutGrid
              width={18}
              height={18}
              color={mode === "grid" ? "#3b82f6" : "#000"}
              className={`group-hover:text-primary`}
            />
          </button>
        </div>
      </div>
      {mode === "grid" && (
        <WordGrid words={words} onClickTitle={handleTitleClick} />
      )}
      {mode === "list" && (
        <WordTable words={words} onClickTitle={handleTitleClick} />
      )}
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
