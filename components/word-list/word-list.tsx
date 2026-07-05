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
  hasNextPage = false,
  onFetchNextPage,
  isFetchingNextPage = false,
}: {
  words: WordWithMeanings[];
  totalCount: number;
  hasNextPage?: boolean;
  onFetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}) => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = React.useState("");

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

  // Debounce search input - wait 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedGlobalFilter(globalFilter);
    }, 800);

    return () => clearTimeout(timer);
  }, [globalFilter]);

  useEffect(() => {
    if (
      !isFetchingNextPage &&
      debouncedGlobalFilter.trim() &&
      hasNextPage &&
      onFetchNextPage
    ) {
      // Count how many words match the current search
      const filteredCount = words.filter((word) => {
        const searchLower = debouncedGlobalFilter.toLowerCase();
        return (
          word.word.toLowerCase().includes(searchLower) ||
          word.meanings.some((meaning) =>
            meaning.definition.toLowerCase().includes(searchLower),
          )
        );
      }).length;

      // If no results found but there are more pages, load next page
      if (filteredCount === 0) {
        onFetchNextPage();
      }
    }
  }, [
    debouncedGlobalFilter,
    hasNextPage,
    isFetchingNextPage,
    onFetchNextPage,
    words,
  ]);

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
            title="Table view"
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
            title="Grid view"
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
        <WordGrid
          words={words}
          onClickTitle={handleTitleClick}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          isLoadingAll={isFetchingNextPage}
        />
      )}
      {mode === "list" && (
        <WordTable
          words={words}
          onClickTitle={handleTitleClick}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          isLoadingAll={isFetchingNextPage}
        />
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
