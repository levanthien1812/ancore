"use client";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Bookmark, EllipsisIcon } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import AddOrEditWord from "../add-word/add-word";
import { CEFRLevel } from "@/lib/constants/enums";
import { getWordOfTheDay } from "@/lib/actions/word.actions";
import {
  enableWordOfTheDay,
  getWordOfTheDayPreference,
  stopWordOfTheDay,
} from "@/lib/actions/user.actions";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
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
  const { status } = useSession();
  const [wordOfTheDay, setWordOfTheDay] = useState<WordOfTheDay | null>(null);
  const [isStopped, setIsStopped] = useState(false);
  const [isLoadingWord, setIsLoadingWord] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadWordOfTheDay = useCallback(async () => {
    if (status !== "authenticated") {
      setWordOfTheDay(null);
      setIsStopped(false);
      setIsLoadingWord(false);
      return;
    }

    setNotification(null);
    setIsLoadingWord(true);

    const preference = await getWordOfTheDayPreference();
    if (preference.stopped) {
      setIsStopped(true);
      setWordOfTheDay(null);
      setIsLoadingWord(false);
      return;
    }

    setIsStopped(false);

    const cachedWordOfTheDay = localStorage.getItem("wordOfTheDay");
    if (cachedWordOfTheDay) {
      const { word, date } = JSON.parse(cachedWordOfTheDay);
      if (word && new Date(date).toDateString() === new Date().toDateString()) {
        setWordOfTheDay(word);
        setIsLoadingWord(false);
        return;
      } else {
        localStorage.removeItem("wordOfTheDay");
      }
    }

    try {
      const result = await getWordOfTheDay();
      setWordOfTheDay(result);
      if (result) {
        localStorage.setItem(
          "wordOfTheDay",
          JSON.stringify({ word: result, date: new Date().toISOString() }),
        );
      }
    } catch (error) {
      console.error("Failed to fetch word of the day:", error);
      setNotification(
        "Failed to load Word of the Day. Please try again later.",
      );
    } finally {
      setIsLoadingWord(false);
    }
  }, [status]);

  useEffect(() => {
    loadWordOfTheDay();
  }, [loadWordOfTheDay]);

  const handleStop = useCallback(async () => {
    setNotification(null);
    const result = await stopWordOfTheDay();
    if (result.success) {
      localStorage.removeItem("wordOfTheDay");
      setIsStopped(true);
      setWordOfTheDay(null);
    }
    setNotification(result.message);
  }, []);

  const handleEnable = useCallback(async () => {
    setNotification(null);
    const result = await enableWordOfTheDay();
    if (result.success) {
      setIsStopped(false);
      await loadWordOfTheDay();
    }
    setNotification(result.message);
  }, [loadWordOfTheDay]);

  // 1. Handle Session Loading
  if (status === "loading") {
    return <WordOfTheDaySkeleton />;
  }

  // 2. Handle Unauthenticated (Hide component if user is not logged in)
  if (status === "unauthenticated") {
    return null;
  }

  // 3. Handle Stopped Mode
  if (isStopped) {
    return (
      <div className="py-6 px-4 rounded-2xl bg-purple-50 h-full border border-purple-300">
        <div className="flex gap-2 justify-between">
          <p className="text-xl font-bold">✨ Word of the day ✨</p>
        </div>
        <Alert className="mt-4">
          <AlertTitle>Word of the day stopped</AlertTitle>
          <AlertDescription>
            You have stopped the Word of the Day feature. Re-enable it anytime
            to receive daily word suggestions again.
          </AlertDescription>
        </Alert>
        {notification ? (
          <Alert className="mt-4" variant="default">
            <AlertDescription>{notification}</AlertDescription>
          </Alert>
        ) : null}
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => startTransition(() => void handleEnable())}
            isLoading={isPending}
          >
            Enable Word of the Day
          </Button>
        </div>
      </div>
    );
  }

  // 4. Handle Data Loading (Fetching word from API/LocalDB)
  if (isLoadingWord) {
    return <WordOfTheDaySkeleton />;
  }

  if (!wordOfTheDay) {
    return (
      <div className="py-6 px-4 rounded-2xl bg-purple-50 h-full border border-purple-300">
        <div className="flex gap-2 justify-between">
          <p className="text-xl font-bold">✨ Word of the day ✨</p>
        </div>
        <Alert className="mt-4" variant="destructive">
          <AlertTitle>Word of the Day unavailable</AlertTitle>
          <AlertDescription>
            {notification ||
              "Unable to fetch Word of the Day right now. Please try again later."}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => startTransition(() => void loadWordOfTheDay())}
            isLoading={isPending}
          >
            Retry
          </Button>
        </div>
      </div>
    );
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
              <Button
                variant={"outline"}
                onClick={() => startTransition(() => void handleStop())}
                isLoading={isPending}
              >
                Stop
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {notification ? (
        <Alert className="mt-4" variant="default">
          <AlertDescription>{notification}</AlertDescription>
        </Alert>
      ) : null}
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
        <AddOrEditWord
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
