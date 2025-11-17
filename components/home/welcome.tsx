"use client";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { CircleQuestionMark, Plus, SquareStar } from "lucide-react";
import { getLearnStreak } from "@/lib/actions/word.actions";
import Image from "next/image";
import fireGpt from "@/public/images/fire-gpt.png";

const Welcome = () => {
  const [wordsLearned, setWordsLearned] = React.useState(0);
  const [streak, setStreak] = React.useState(0);

  useEffect(() => {
    (async () => {
      const streak = await getLearnStreak();
      setStreak(streak);
    })();
  }, []);

  const session = useSession();

  if (!session || !session.data?.user) return null;
  const user = session.data.user;
  const firstName = user.name?.split(" ")[0] || "You";

  return (
    <div className=" flex flex-col bg-background-2 p-8 rounded-2xl">
      <p className="text-[40px] font-bold text-primary">👋Hi {firstName}!</p>
      <p className="text-xl mt-2">
        You&apos;ve learned{" "}
        <span className="font-bold text-primary-2 text-2xl">
          {wordsLearned} words
        </span>{" "}
        in a row
      </p>
      <p className="text-xl mt-2">
        Your current streak is{" "}
        <span className="font-bold text-primary-2 text-2xl">{streak}</span>!
      </p>
      <div className="flex justify-between mt-auto items-end">
        <div className="flex flex-col gap-2">
          <Button className="justify-start">
            <Plus className="text-primary-2" /> Add word
          </Button>
          <Button className="justify-start">
            <SquareStar className="text-primary-2" /> Review now
          </Button>
          <Button className="justify-start">
            <CircleQuestionMark className="text-primary-2" /> Take quit
          </Button>
        </div>
        <Image src={fireGpt} alt="fire" height={160} />
      </div>
    </div>
  );
};

export default Welcome;
