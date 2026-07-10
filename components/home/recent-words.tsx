"use client";
import { getNotableWords, getRecentWords } from "@/lib/actions/word.actions";
import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "../ui/table";
import WordMasteryLevel from "../word-list/word-mastery-level";
import { format } from "date-fns";
import { MasteryLevel, MasteryLevelColorCode } from "@/lib/constants/enums";
import { Button } from "../ui/button";
import WordDialog from "../word-card/word-dialog";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { RefreshCcw } from "lucide-react";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import { handlePlayAudio } from "@/lib/utils/handlePlayAudio";
import { shorten } from "@/lib/utils/shorten";
import { useLayout } from "../layout/layout-context";
import { Popover, PopoverTrigger } from "../ui/popover";
import { PopoverContent } from "@radix-ui/react-popover";
import WordDetail from "../word-card/word-detail";
import MotionLightBand from "../shared/motion-light-band";
import { REFETCH_NOTABLE_WORDS_INTERVAL } from "@/lib/constants/constant";
import AddOrEditWord from "../add-word/add-word";
import { Separator } from "../ui/separator";

const RecentWords = () => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const { settings } = useLayout();

  const results = useQueries({
    queries: [
      {
        queryKey: [QUERY_KEY.GET_RECENT_WORDS],
        queryFn: getRecentWords,
        initialData: [],
      },
      {
        queryKey: [QUERY_KEY.GET_NOTABLE_WORDS],
        queryFn: getNotableWords,
        initialData: [],
        refetchInterval: REFETCH_NOTABLE_WORDS_INTERVAL,
      },
    ],
  });

  const [recentWordsQuery, notableWordsQuery] = results;

  const words = recentWordsQuery.data;
  const notableWords = notableWordsQuery.data;

  const refetch = async () => {
    await Promise.all([
      recentWordsQuery.refetch(),
      notableWordsQuery.refetch(),
    ]);
  };

  useEffect(() => {
    if (selectedIndex !== null && words[selectedIndex]) {
      handlePlayAudio(
        words[selectedIndex].word,
        settings?.autoPlayPronunciation,
      );
    }
  }, [selectedIndex, words, settings?.autoPlayPronunciation]);

  const handleRefresh = () => {
    refetch();
  };
  return (
    <div className=" flex flex-col bg-white p-4 rounded-2xl gap-2 h-full">
      <div className="">
        <span className="text-xl sm:text-2xl font-bold text-primary">
          📋 Recent words!
        </span>

        <button
          onClick={handleRefresh}
          className="ms-2 active:rotate-180 transition-all ease-in duration-500 cursor-pointer"
        >
          <RefreshCcw className="text-primary" height={16} />
        </button>
      </div>
      {recentWordsQuery.isFetching && <RecentWordsLoadingSkeleton />}
      {!recentWordsQuery.isFetching && recentWordsQuery.data.length === 0 && (
        <div className="flex flex-col gap-2 items-center justify-center">
          <p className="text-center text-lg text-muted-foreground">
            You have no words yet. Start by adding some!
          </p>
          <AddOrEditWord />
        </div>
      )}
      {!recentWordsQuery.isFetching && recentWordsQuery.data.length > 0 && (
        <>
          <div className="border border-primary rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-primary">
                  <TableHead className="w-[200px] px-4">Word</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last review</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {words.map((word, index) => (
                  <TableRow key={word.id} className="border-b border-primary">
                    <TableCell
                      className={`font-bold text-lg sm:text-xl px-2 sm:px-4 ${
                        index % 2 === 0 ? "text-primary-2" : "text-primary"
                      }`}
                    >
                      {shorten(word.word, 20)}
                    </TableCell>
                    <TableCell>
                      <WordMasteryLevel
                        level={word.masteryLevel as MasteryLevel}
                        wordId={word.id}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {format(word.updatedAt, "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size={"sm"}
                        variant={"link"}
                        className="bg-transparent py-1 h-fit"
                        onClick={() => setSelectedIndex(index)}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end mt-2">
            <Link className="hover:underline text-primary" href={"/words"}>
              👉 Go to word list
            </Link>
          </div>
          <WordDialog
            word={selectedIndex !== null ? words[selectedIndex] : null}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            totalWord={words.length}
          />
        </>
      )}

      <Separator className="my-2" />

      <div>
        <span className="text-xl sm:text-2xl font-bold text-primary">
          ⭐ Notable words!
        </span>

        {notableWordsQuery.isFetching && <NotableWordsLoadingSkeleton />}
        {!notableWordsQuery.isFetching && notableWords.length === 0 && (
          <div className="flex flex-col gap-2 items-center justify-center">
            <p className="text-center text-lg text-muted-foreground">
              You have no notable words yet. Start by adding some!
            </p>
            <AddOrEditWord />
          </div>
        )}
        {!notableWordsQuery.isFetching && notableWords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 ">
            {notableWords.map((w, index) => {
              return (
                <Popover key={`${w.id}-${index}`}>
                  <PopoverTrigger asChild>
                    <button
                      className={`relative overflow-hidden border border-b-3 border-r-2 text-sm px-2 py-1 rounded-md cursor-pointer transition`}
                      style={{
                        borderColor:
                          MasteryLevelColorCode[w.masteryLevel].primary,
                        backgroundColor: `${MasteryLevelColorCode[w.masteryLevel].primary}20`,
                      }}
                      onClick={() => {
                        handlePlayAudio(w.word);
                      }}
                    >
                      {w.word}
                      <MotionLightBand />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-screen sm:w-120 overflow-hidden bg-primary p-4 rounded-2xl"
                    side="top"
                  >
                    <WordDetail word={w} showReviewStats={false} />
                  </PopoverContent>
                </Popover>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const RecentWordsLoadingSkeleton = () => (
  <Table>
    <TableBody>
      {Array.from({ length: 15 }).map((_, index) => (
        <TableRow key={index} className="">
          <TableCell className="text-center">
            <Skeleton className="h-6 w-full" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-6 w-full" />
          </TableCell>
          <TableCell className="text-center">
            <Skeleton className="h-6 w-full" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const NotableWordsLoadingSkeleton = () => {
  const skeletonWidths = [
    80, 96, 72, 112, 88, 104, 64, 120, 92, 76, 108, 84, 100, 68, 96,
  ];
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {skeletonWidths.map((width, index) => (
        <Skeleton key={index} className="h-8" style={{ width }} />
      ))}
    </div>
  );
};

export default RecentWords;
