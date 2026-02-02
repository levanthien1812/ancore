"use client";

import WordList from "@/components/word-list/word-list";
import { getWordListByFilter } from "@/lib/actions/word.actions";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 50;

const WordsPage = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY.GET_WORDS],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const result = await getWordListByFilter({
          page: pageParam as number,
          limit: PAGE_SIZE,
        });
        return result;
      } catch (err) {
        console.error("Failed to fetch words:", err);
        throw err;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const allWords = data?.pages.flat() || [];

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
      <WordList words={allWords} />
      {hasNextPage && (
        <div className="mt-4">
          <Button
            variant={"outline"}
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load more words"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WordsPage;
