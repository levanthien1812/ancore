"use client";

import WordList from "@/components/word-list/word-list";
import { getWordListByFilter } from "@/lib/actions/word.actions";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/components/layout/layout-context";

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
  const { mode } = useLayout();

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-2 p-4 md:p-0">
        <h2 className="text-3xl">Word list</h2>
        {mode === "list" && (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton className="h-12 w-full" key={index} />
            ))}
          </div>
        )}
        {mode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton className="h-36 sm:h-28 w-full" key={index} />
            ))}
          </div>
        )}
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

  if (allWords.length === 0) {
    return (
      <div className="container mx-auto space-y-2 p-4">
        <h2 className="text-3xl">Word list</h2>
        <div className="flex flex-col justify-center items-center gap-4 h-full border rounded-lg p-4 text-center">
          <p className="text-muted-foreground text-2xl">No words found.</p>
          <p className="text-muted-foreground">
            Try adding some new words or adjusting your search/filter to find
            what you&apos;re looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-2 p-4">
      <h2 className="text-3xl">Word list</h2>
      <WordList words={allWords} />
      {hasNextPage && (
        <div className="mt-4">
          <Button
            variant={"outline"}
            onClick={() => fetchNextPage()}
            className="w-full sm:w-auto"
            isLoading={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load more words"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WordsPage;
