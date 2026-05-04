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
import Star from "@/public/images/star.png";
import Fire from "@/public/images/fire.png";

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
      <div className=" flex flex-col bg-white p-4 md:p-6 rounded-2xl">
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
    <div className=" flex flex-col bg-white p-4 rounded-2xl gap-2 h-full">
      <p className="text-3xl md:text-[40px] font-bold text-primary">
        👋Hi {userName}!
      </p>
      <p className="text-md text-muted-foreground">Keep up the great work!</p>
      <div className="flex gap-2 w-full flex-1">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex gap-2 p-3 bg-orange-50 rounded-md items-center">
            <div className="rounded-full p-3 bg-orange-100 flex items-center justify-center">
              <Image src={Star} alt="star" width={24} height={24} />
            </div>
            <p className="leading-none text-sm text-gray-500">
              You&apos;ve learned <br />
              {isFetchingWordsLearned ? (
                <Skeleton className="h-5 w-20 inline-block" />
              ) : (
                <span className="text-2xl font-bold mr-1 text-black">
                  {wordsLearned}
                </span>
              )}{" "}
              words in a row
            </p>
          </div>
          <div className="flex gap-2 p-3 bg-orange-50 rounded-md items-center">
            <div className="rounded-full p-3 bg-orange-100 flex items-center justify-center">
              <Image src={Fire} alt="star" width={24} height={24} />
            </div>
            <p className="leading-none text-sm text-gray-500">
              Your current streak is <br />
              {isFetchingStreak ? (
                <Skeleton className="h-5 w-20 inline-block" />
              ) : (
                <span className="text-2xl font-bold mr-1 text-black">
                  {streak}
                </span>
              )}{" "}
              days
            </p>
          </div>
          <div className="flex flex-col gap-1 mt-auto">
            <AddWord
              triggerButton={
                <Button className="w-full justify-start">
                  <Plus className="text-white" width={16} /> Add word
                </Button>
              }
            />

            <Link href={"/review"}>
              <Button className="w-full justify-start" variant={"outline"}>
                <SquareStar className="text-primary" width={16} /> Review now
              </Button>
            </Link>
            <Link href={"/quizzes"}>
              <Button className="w-full justify-start" variant={"outline"}>
                <CircleQuestionMark className="text-primary" width={16} /> Take
                quit
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-end">
          <Image src={fireGpt} alt="fire" height={120} />
        </div>
      </div>
    </div>
  );
};

export default Welcome;
