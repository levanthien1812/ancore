"use client";
import { useTransition, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  createQuizSession,
  getLatestIncompleteQuiz,
} from "@/lib/actions/quiz.actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import quizIllustration from "@/public/images/quiz-illustration.jpg";
import { useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { deleteQuiz } from "@/lib/actions/quiz.actions";
import { format } from "date-fns";
import { MotionButton } from "../shared/motion-button";
import { toast } from "sonner";
import { handlePlayAudio } from "@/lib/utils/handlePlayAudio";

const QuizIntro = ({
  wordsToQuizCount,
  estimatedTime,
  specificWords,
}: {
  wordsToQuizCount: number;
  estimatedTime: number;
  specificWords?: string[];
}) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);

  // Simulated progress logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPending) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 96) return prev; // Hold at 92% until the server actually responds
          const increment = prev < 40 ? 8 : prev < 70 ? 6 : 2;
          return prev + increment;
        });
      }, 400);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isPending]);

  const handleStartQuiz = () => {
    const audio = new Audio("/sounds/loading.mp3");
    audio.loop = true;
    handlePlayAudio(audio);
    startTransition(async () => {
      const result = await createQuizSession(wordsToQuizCount, specificWords);
      if (result.success && result.quizId) {
        router.push(`/quizzes/${result.quizId}`);
        localStorage.removeItem("incompleteQuizId");
      } else {
        toast.error(result.message || "Failed to start quiz session.");
      }
      audio.pause();
    });
  };

  const { data: incompleteQuiz } = useQuery({
    queryKey: ["latestIncompleteQuiz"],
    queryFn: async () => {
      const quiz = await getLatestIncompleteQuiz();
      const storedQuizId = localStorage.getItem("incompleteQuizId");
      if (quiz && quiz.id !== storedQuizId) {
        setShowIncompleteDialog(true);
      }
      return quiz;
    },
    enabled: true,
  });

  const handleContinue = () => {
    if (incompleteQuiz) {
      router.push(`/quizzes/${incompleteQuiz.id}`);
      localStorage.removeItem("incompleteQuizId");
    }
  };

  const handleStartNew = async () => {
    if (incompleteQuiz && incompleteQuiz.answeredCount === 0) {
      await deleteQuiz(incompleteQuiz.id);
    }
    localStorage.setItem(
      "incompleteQuizId",
      incompleteQuiz ? incompleteQuiz.id : "",
    );
    setShowIncompleteDialog(false);
  };

  if (wordsToQuizCount === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 h-full rounded-[24px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] p-4 text-center">
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
    <div className="flex flex-col justify-center items-center gap-4 h-full rounded-[24px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)] p-4 text-center">
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
      <div className="w-full space-y-2">
        <MotionButton
          onClick={handleStartQuiz}
          size="lg"
          isLoading={isPending}
          className="relative overflow-hidden"
          variant={"magic"}
        >
          {isPending
            ? `Preparing quiz (${Math.floor(progress)}%)...`
            : "Start Quiz"}
        </MotionButton>
        {isPending && (
          <div className="bg-muted h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <AlertDialog
        open={showIncompleteDialog}
        onOpenChange={setShowIncompleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Incomplete Quiz Found</AlertDialogTitle>
            <AlertDialogDescription>
              You have an unfinished quiz from{" "}
              {incompleteQuiz &&
                format(new Date(incompleteQuiz.createdAt), "PPP")}
              . Would you like to continue it or start a new one?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStartNew}>
              Start New Quiz
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleContinue}>
              Continue Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizIntro;
