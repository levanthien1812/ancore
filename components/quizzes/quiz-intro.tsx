"use client";

import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createQuizSession } from "@/lib/actions/quiz.actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import quizIllustration from "@/public/images/quiz-illustration.jpg";

const QuizIntro = ({
  wordsToQuizCount,
  estimatedTime,
}: {
  wordsToQuizCount: number;
  estimatedTime: number;
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStartQuiz = () => {
    startTransition(async () => {
      const result = await createQuizSession();
      if (result.success && result.quizLogId) {
        router.push(`/quizzes/${result.quizLogId}`);
      } else {
        // TODO: Implement user-friendly error handling, e.g., a toast notification
        console.error(result.message || "Failed to start quiz session.");
      }
    });
  };

  if (wordsToQuizCount === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 h-full border rounded-lg p-4 text-center">
        <p className="text-2xl font-semibold">No words to quiz!</p>
        <p className="text-muted-foreground">
          Add some new words or start learning existing ones to generate a quiz.
        </p>
        <Button asChild>
          <Link href="/words">Go to Word List</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4 h-full border rounded-lg p-4 text-center">
      <h1 className="text-2xl font-bold">Ready for a Quiz?</h1>
      <Image
        src={quizIllustration}
        alt="illustratioin"
        className="w-full rounded-2xl"
      />
      <div className="text-muted-foreground text-center">
        <p>You have {wordsToQuizCount} words ready to be quizzed.</p>
        <p className="text-sm">
          (Approx. {estimatedTime} {estimatedTime > 1 ? "minutes" : "minute"})
        </p>
      </div>
      <Button onClick={handleStartQuiz} disabled={isPending} size="lg">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Start Quiz
      </Button>
    </div>
  );
};

export default QuizIntro;
