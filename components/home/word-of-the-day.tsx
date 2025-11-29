"use client";
import { buildWordOfTheDayPrompt } from "@/lib/ai-prompts/word-of-the-day";
import { User } from "@/lib/generated/prisma/client";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { BookmarkPlus } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import AddWord from "../add-word/add-word";
import { CEFRLevel } from "@/lib/constants/enums";

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
  const session = useSession();
  const [wordOfTheDay, setWordOfTheDay] = useState<WordOfTheDay | null>(null);

  const fetchWordOfTheDay = useCallback(async () => {
    if (!session.data) return;
    const cachedWordOfTheDay = localStorage.getItem("wordOfTheDay");
    if (cachedWordOfTheDay) {
      const { word, date } = JSON.parse(cachedWordOfTheDay);
      if (new Date(date).toDateString() === new Date().toDateString()) {
        setWordOfTheDay(word);
        return;
      } else {
        localStorage.removeItem("wordOfTheDay");
      }
    }

    const prompt = buildWordOfTheDayPrompt(session.data.user as User);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      const result = JSON.parse(data.result);
      setWordOfTheDay(result);
      localStorage.setItem(
        "wordOfTheDay",
        JSON.stringify({ word: result, date: new Date().toISOString() })
      );
    } catch (error) {
      console.log(error);
    }
  }, [session.data]);

  useEffect(() => {
    (async () => {
      fetchWordOfTheDay();
    })();
  }, [fetchWordOfTheDay]);

  return (
    <div className="mt-8">
      <p className="text-xl font-bold">✨ Word of the day ✨</p>
      {wordOfTheDay && (
        <div className="border-2 border-dashed border-primary-2 p-3 rounded-2xl">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col justify-center items-center p-3 bg-amber-300 rounded-xl w-full">
              <p className="text-3xl text-primary font-bold">
                {wordOfTheDay?.word}
              </p>
              <p className="text-gray-600 text-nowrap text-sm">
                {wordOfTheDay?.pronunciation}
              </p>
            </div>
            <div className="flex gap-2 justify-between">
              <div>
                <p className="font-bold">
                  ({wordOfTheDay?.meanings[0]?.partOfSpeech}) -{" "}
                  {wordOfTheDay?.meanings[0]?.definition}
                </p>
                <p className="text-gray-600 italic text-sm mt-1">Example:</p>
                <ul className="list-disc ms-4 text-gray-600 italic text-sm">
                  {wordOfTheDay?.meanings[0]?.exampleSentences
                    .split("|")
                    .map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                </ul>
              </div>
              <div className="flex items-end justify-center">
                <AddWord
                  triggerButton={
                    <button className="p-2 rounded-lg bg-blue-100 cursor-pointer hover:bg-blue-200">
                      <BookmarkPlus className="text-primary" />
                    </button>
                  }
                  wordOfTheDay={wordOfTheDay}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {!wordOfTheDay && (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-28 rounded-xl" />
          <div className="space-y-2 grow">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      )}
    </div>
  );
};

export default WordOfTheDay;
