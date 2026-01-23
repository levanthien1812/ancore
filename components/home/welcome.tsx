"use client";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { CircleQuestionMark, Plus, SquareStar } from "lucide-react";
import {
  getLearnStreak,
  getWordCountLearned,
} from "@/lib/actions/word.actions";
import Image from "next/image";
import fireGpt from "@/public/images/fire-gpt.png";
import AddWord from "../add-word/add-word";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { QUERY_KEY } from "@/lib/constants/queryKey";

const Welcome = () => {
  const { data: streak, isFetching: isFetchingStreak } = useQuery({
    queryKey: [QUERY_KEY.GET_LEARN_STREAK],
    queryFn: getLearnStreak,
    initialData: 0,
  });

  const { data: wordsLearned, isFetching: isFetchingWordsLearned } = useQuery({
    queryKey: [QUERY_KEY.GET_WORDS_LEARNED],
    queryFn: getWordCountLearned,
    initialData: 0,
  });

  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className=" flex flex-col bg-background-2 p-4 md:p-6 rounded-2xl h-full">
        <Skeleton className="h-12 w-3/4" />
        <div className="mt-2">
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="mt-2">
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="flex justify-between mt-auto items-end">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-[120px] w-[120px]" />
        </div>
      </div>
    );
  }

  const userName = session?.user?.name?.split(" ")[0] || "You";

  return (
    <div className=" flex flex-col bg-background-2 p-4 md:p-8 rounded-2xl h-full">
      <p className="text-3xl md:text-[40px] font-bold text-primary">
        👋Hi {userName}!
      </p>
      <div className="text-xl mt-2">
        You&apos;ve learned{" "}
        {isFetchingWordsLearned ? (
          <Skeleton className="h-5 w-20" />
        ) : (
          <span className="font-bold text-primary-2 text-2xl">
            {wordsLearned} words
          </span>
        )}{" "}
        in a row
      </div>
      <div className="text-xl mt-2">
        Your current streak is{" "}
        {isFetchingStreak ? (
          <Skeleton className="h-5 w-20" />
        ) : (
          <span className="font-bold text-primary-2 text-2xl">{streak}</span>
        )}
      </div>
      <div className="flex justify-between mt-auto items-end">
        <div className="flex flex-col gap-2">
          <AddWord
            triggerButton={
              <Button className="justify-start">
                <Plus className="text-primary-2" /> Add word
              </Button>
            }
          />

          <Link href={"/review"}>
            <Button className="justify-start">
              <SquareStar className="text-primary-2" /> Review now
            </Button>
          </Link>
          <Link href={"/quizzes"}>
            <Button className="justify-start">
              <CircleQuestionMark className="text-primary-2" /> Take quit
            </Button>
          </Link>
        </div>
        <Image src={fireGpt} alt="fire" height={120} />
      </div>
    </div>
  );
};

export default Welcome;
