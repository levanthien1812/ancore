"use client";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Bookmark, BookmarkPlus } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import AddWord from "../add-word/add-word";
import { CEFRLevel } from "@/lib/constants/enums";
import { getWordOfTheDay } from "@/lib/actions/word.actions";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { EllipsisIcon } from "lucide-react";
export interface WordOfTheDay {
  word: string;
  pronunciation: string;
  cefrLevel: CEFRLevel;
  meanings: {
    definition: string;
    partOfSpeech: string;
    exampleSentences: string;
  }[];
}

const WordOfTheDay = () => {
  const { data: session, status } = useSession();
  const [wordOfTheDay, setWordOfTheDay] = useState<WordOfTheDay | null>(null);

  useEffect(() => {
    const loadWordOfTheDay = async () => {
      if (status !== "authenticated") {
        setWordOfTheDay(null); // Clear word if session is not active
        return;
      }
      const cachedWordOfTheDay = localStorage.getItem("wordOfTheDay");
      if (cachedWordOfTheDay) {
        const { word, date } = JSON.parse(cachedWordOfTheDay);
        if (
          word &&
          new Date(date).toDateString() === new Date().toDateString()
        ) {
          setWordOfTheDay(word);
          return;
        } else {
          localStorage.removeItem("wordOfTheDay");
        }
      }
      try {
        const result = await getWordOfTheDay();
        setWordOfTheDay(result);
        localStorage.setItem(
          "wordOfTheDay",
          JSON.stringify({ word: result, date: new Date().toISOString() }),
        );
      } catch (error) {
        console.error("Failed to fetch word of the day:", error); // Use console.error for errors
      }
    };
    loadWordOfTheDay();
  }, [status]);

  console.log({ status, wordOfTheDay });

  // 1. Handle Session Loading
  if (status === "loading") {
    return <WordOfTheDaySkeleton />;
  }

  // 2. Handle Unauthenticated (Hide component if user is not logged in)
  if (status === "unauthenticated") {
    return null;
  }

  // 3. Handle Data Loading (Fetching word from API/LocalDB)
  if (!wordOfTheDay) {
    return <WordOfTheDaySkeleton />;
  }

  return (
    <div className="py-6 px-4 rounded-2xl bg-purple-50 h-full border border-purple-300">
      <div className="flex gap-2 justify-between">
        <p className="text-xl font-bold">✨ Word of the day ✨</p>
        <Popover>
          <PopoverTrigger asChild>
            <EllipsisIcon width={18} />
          </PopoverTrigger>
          <PopoverContent className="w-fit p-0">
            <div>
              <Button variant={"outline"}>Stop</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-3 mt-3">
        <div className="flex flex-col justify-center items-center p-3 bg-purple-100 rounded-xl">
          <p className="text-2xl text-purple-600 font-bold">
            {wordOfTheDay.word}
          </p>
          <p className="text-gray-600 text-nowrap text-sm">
            {wordOfTheDay.pronunciation}
          </p>
        </div>
        <div className="">
          <div>
            <p className="font-bold text-purple-600">Meaning</p>
            <p className="text-justify">
              ({wordOfTheDay.meanings[0]?.partOfSpeech}) -{" "}
              {wordOfTheDay.meanings[0]?.definition}
            </p>
          </div>
          <div className="mt-2">
            <p className="font-bold text-purple-600">Example:</p>
            <ul className="list-disc ms-4 text-gray-600 italic text-sm">
              {wordOfTheDay.meanings[0]?.exampleSentences
                .split("|")
                .map((example, index) => (
                  <li key={index} className="text-justify">
                    {example}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        <AddWord
          triggerButton={
            <button className="p-2 rounded-md cursor-pointer hover:bg-purple-100 flex gap-1 items-center text-primary text-sm">
              <Bookmark width={20} /> Save word
            </button>
          }
          wordOfTheDay={wordOfTheDay}
        />
      </div>
    </div>
  );
};

const WordOfTheDaySkeleton = () => (
  <div className="py-6 px-4 rounded-2xl bg-purple-50 h-full flex flex-col gap-3">
    <Skeleton className="h-7 w-32" />
    <div className="flex flex-col justify-center items-center p-3 bg-purple-100 rounded-xl h-24">
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-12 w-full" />
    </div>
    <div className="mt-2 space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-16 w-full" />
    </div>
    <div className="mt-auto flex justify-end">
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

export default WordOfTheDay;
