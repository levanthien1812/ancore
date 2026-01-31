"use client";
import React, { useEffect, useState } from "react";
import { WordWithMeanings } from "../add-word/add-word-form";
import WordTable from "./word-table";
import WordDialog from "../word-card/word-dialog";
import { Button } from "../ui/button";

const PAGE_SIZE = 50;

const WordList = ({
  words: initialWords,
  onLoadMore,
}: {
  words: WordWithMeanings[];
  onLoadMore: (page: number) => Promise<WordWithMeanings[]>;
}) => {
  const [words, setWords] = useState(initialWords);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialWords.length >= PAGE_SIZE);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const word = selectedIndex !== null ? words[selectedIndex] : undefined;

  useEffect(() => {
    setWords(initialWords);
    setPage(1);
    setHasMore(initialWords.length >= PAGE_SIZE);
  }, [initialWords]);

  const handleTitleClick = React.useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const newWords = await onLoadMore(nextPage);
      if (newWords.length < PAGE_SIZE) {
        setHasMore(false);
      }
      setWords((prev) => [...prev, ...newWords]);
      setPage(nextPage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p>
        Total words:{" "}
        <span className="text-primary-2 font-bold text-xl">{words.length}</span>
      </p>
      <WordTable words={words} onClickTitle={handleTitleClick} />
      {hasMore && (
        <div>
          <Button
            variant={"outline"}
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load more words"}
          </Button>
        </div>
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
