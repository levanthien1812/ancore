"use client";

import WordList from "@/components/word-list/word-list";
import { getWordListByFilter } from "@/lib/actions/word.actions";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { QUERY_KEY } from "@/lib/constants/queryKey";

const WordsPage = () => {
  const {
    data: wordList,
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEY.GET_WORDS],
    queryFn: async () => {
      try {
        const result = await getWordListByFilter({
          page: 1,
          limit: 50,
        });
        return result;
      } catch (err) {
        console.error("Failed to fetch words:", err);
        throw err;
      }
    },
  });

  const handleLoadMore = async (page: number) => {
    return await getWordListByFilter({
      page,
      limit: 50,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-2 p-4 md:p-0">
        <h2 className="text-3xl">Word list</h2>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto space-y-2 p-4 md:p-0">
        <h2 className="text-3xl">Word list</h2>
        <p className="text-red-500">
          Failed to load word list:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-2 p-4 md:p-0">
      <h2 className="text-3xl">Word list</h2>
      <WordList words={wordList || []} onLoadMore={handleLoadMore} />
    </div>
  );
};

export default WordsPage;
