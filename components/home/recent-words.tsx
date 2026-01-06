"use client";
import { getRecentWords } from "@/lib/actions/word.actions";
import React, { useMemo } from "react";
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
import { MasteryLevel } from "@/lib/constants/enums";
import { Button } from "../ui/button";
import WordDialog from "../word-card/word-dialog";
import WordOfTheDay from "./word-of-the-day";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { RefreshCcw } from "lucide-react";
import { QUERY_KEY } from "@/lib/constants/queryKey";

const RecentWords = () => {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const {
    data: words,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEY.GET_RECENT_WORDS],
    queryFn: getRecentWords,
    initialData: [],
    refetchOnWindowFocus: false,
  });

  const handleRefresh = () => {
    refetch();
  };

  const tableSkeleton = useMemo(() => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index} className="border-b border-primary">
        <TableCell className="text-center">
          <Skeleton className="h-5 w-full" />
        </TableCell>
        <TableCell className="text-center">
          <Skeleton className="h-5 w-full" />
        </TableCell>
        <TableCell className="text-center">
          <Skeleton className="h-5 w-full" />
        </TableCell>
      </TableRow>
    ));
  }, []);

  return (
    <div className=" flex flex-col bg-background-2 p-8 rounded-2xl">
      <div className="">
        <span className="text-[40px] font-bold text-primary">
          📋 Recent words!
        </span>

        <button
          onClick={handleRefresh}
          className="ms-2 active:rotate-180 transition-all ease-in duration-500 cursor-pointer"
        >
          <RefreshCcw className="text-primary" height={20} />
        </button>
      </div>
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
            {isFetching
              ? tableSkeleton
              : words.map((word, index) => (
                  <TableRow key={word.id} className="border-b border-primary">
                    <TableCell
                      className={`font-bold text-xl px-4 ${
                        index % 2 === 0 ? "text-primary-2" : "text-primary"
                      }`}
                    >
                      {word.word}
                    </TableCell>
                    <TableCell>
                      <WordMasteryLevel
                        level={word.masteryLevel as MasteryLevel}
                        wordId={word.id}
                      />
                    </TableCell>
                    <TableCell>
                      {format(word.updatedAt, "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size={"sm"}
                        variant={"outline"}
                        className="bg-transparent"
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
      <WordOfTheDay />
    </div>
  );
};

export default RecentWords;
