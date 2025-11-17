"use client";
import { buildWordOfTheDayPrompt } from "@/lib/ai-prompts/word-of-the-day";
import { User } from "@/lib/generated/prisma/client";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { BookmarkPlus } from "lucide-react";
import AddWordForm from "../add-word/add-word-form";

type WordOfTheDay = {
  word: string;
  pronunciation: string;
  cefrLevel: string;
  meanings: {
    definition: string;
    partOfSpeech: string;
    exampleSentences: string;
  }[];
};

const sampleObject: WordOfTheDay = {
  word: "Persevere",
  pronunciation: "per-suh-veer",
  cefrLevel: "B1",
  meanings: [
    {
      definition:
        "Continue in a course of action even in the face of difficulty or with little or no indication of success.",
      partOfSpeech: "verb",
      exampleSentences:
        "Despite facing challenges, she persevered with her studies and eventually graduated with honors.",
    },
  ],
};

const WordOfTheDay = () => {
  const session = useSession();
  const [wordOfTheDay, setWordOfTheDay] = useState<WordOfTheDay | null>(
    sampleObject
  );

  const fetchWordOfTheDay = useCallback(async () => {
    if (!session.data) return;
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
    } catch (error) {
      console.log(error);
    }
  }, [session.data]);

  useEffect(() => {
    (async () => {
      //   fetchWordOfTheDay();
    })();
  }, [fetchWordOfTheDay]);

  return (
    <div className="mt-8">
      <p className="text-xl font-bold">✨ Word of the day ✨</p>
      <div className="border-2 border-dashed border-primary-2 p-4 rounded-2xl">
        <div className="flex gap-2">
          <div className="flex flex-col justify-center p-4 bg-amber-300 rounded-xl">
            <p className="text-3xl text-primary font-bold">
              {wordOfTheDay?.word}
            </p>
            <p className="text-gray-600 text-nowrap text-sm">
              /{wordOfTheDay?.pronunciation}/
            </p>
          </div>
          <div>
            <p className="font-bold">
              ({wordOfTheDay?.meanings[0]?.partOfSpeech}) -{" "}
              {wordOfTheDay?.meanings[0]?.definition}
            </p>
            <p className="text-gray-600 italic text-sm mt-1">
              Example: {wordOfTheDay?.meanings[0]?.exampleSentences}
            </p>
          </div>
          <div className="flex items-center justify-center">
            <Dialog>
              <DialogTrigger>
                <div className="p-4 rounded-xl bg-blue-100 cursor-pointer hover:bg-blue-200">
                  <BookmarkPlus className="text-primary" />
                </div>
              </DialogTrigger>
              <DialogContent>
                <AddWordForm onClose={() => {}} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordOfTheDay;
