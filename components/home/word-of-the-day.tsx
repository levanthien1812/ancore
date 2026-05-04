"use client";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Bookmark, BookmarkPlus } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import AddWord from "../add-word/add-word";
import { CEFRLevel } from "@/lib/constants/enums";
import { getWordOfTheDay } from "@/lib/actions/word.actions";

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
      console.log("cachedWordOfTheDay", cachedWordOfTheDay);
      const { word, date } = JSON.parse(cachedWordOfTheDay);
      if (new Date(date).toDateString() === new Date().toDateString()) {
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
      console.log(error);
    }
  }, [session.data]);

  useEffect(() => {
    (async () => {
      fetchWordOfTheDay();
    })();
  }, [fetchWordOfTheDay]);

  return (
    <>
      {wordOfTheDay && (
        <div className="py-6 px-4 rounded-2xl bg-purple-50">
          <p className="text-xl font-bold">✨ Word of the day ✨</p>
          <div className="flex flex-col md:flex-row gap-3 mt-3">
            <div className="flex flex-col justify-center items-center p-3 bg-purple-100 rounded-xl">
              <p className="text-2xl text-purple-600 font-bold">
                {wordOfTheDay?.word}
              </p>
              <p className="text-gray-600 text-nowrap text-sm">
                {wordOfTheDay?.pronunciation}
              </p>
            </div>
            <div className="">
              <div>
                <p className="font-bold text-purple-600">Meaning</p>
                <p className="text-justify">
                  ({wordOfTheDay?.meanings[0]?.partOfSpeech}) -{" "}
                  {wordOfTheDay?.meanings[0]?.definition}
                </p>
              </div>
              <div className="mt-2">
                <p className="font-bold text-purple-600">Example:</p>
                <ul className="list-disc ms-4 text-gray-600 italic text-sm">
                  {wordOfTheDay?.meanings[0]?.exampleSentences
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
    </>
  );
};

export default WordOfTheDay;
