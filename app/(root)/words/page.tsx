"use client";

import WordList from "@/components/word-list/word-list";
import { getWordListByFilter } from "@/lib/actions/word.actions";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import { Button } from "@/components/ui/button";
import { useLayout } from "@/components/layout/layout-context";
import { DEFAULT_WORDS_PER_FETCH } from "@/lib/constants/constant";

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
          limit: DEFAULT_WORDS_PER_FETCH,
        });
        return result;
      } catch (err) {
        console.error("Failed to fetch words:", err);
        throw err;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.words.length === DEFAULT_WORDS_PER_FETCH
        ? allPages.length + 1
        : undefined;
    },
    initialPageParam: 1,
  });

  const allWords = data?.pages.flatMap((page) => page.words) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;
  const { mode } = useLayout();

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-2 p-4">
        <h2 className="text-3xl">Word list</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-20" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-52" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        <div className="mt-4">
          {mode === "list" && (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton className="h-12 w-full" key={index} />
              ))}
            </div>
          )}
          {mode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Array.from({ length: 20 }).map((_, index) => (
                <Skeleton className="h-36 sm:h-32 w-full" key={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto space-y-2 p-4">
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
        <div className="flex flex-col justify-center items-center gap-4 h-full rounded-[24px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] p-4 text-center">
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
      <WordList
        words={allWords}
        totalCount={totalCount}
        hasNextPage={hasNextPage}
        onFetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
      {hasNextPage && (
        <div className="mt-2">
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
