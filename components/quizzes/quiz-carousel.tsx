"use client";
import { useEffect, useState, useTransition, useCallback } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import QuestionCard from "./question-card";
import { cn } from "@/lib/utils";
import { logQuizResult } from "@/lib/actions/quiz.actions";
import QuizSummary from "./quiz-summary";
import { toast } from "sonner";
import { useBeforeUnload } from "@/lib/hooks/use-before-unload";
import { QuizWithAnswers } from "@/lib/type";
import RetryCarousel from "./retry-carousel";
import { useLayout } from "../layout/layout-context";
import { Button } from "../ui/button";
import { RotateCcw, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type RetryPhase = "idle" | "prompt" | "retrying" | "done";

const QuizCarousel = ({ quiz }: { quiz: QuizWithAnswers }) => {
  const [api, setApi] = useState<CarouselApi>();
  const { settings } = useLayout();

  // Find the first unanswered question to set as the starting point for resumed sessions
  const initialIndex = Math.max(
    0,
    quiz.quizAnswers.findIndex((a) => a.userAnswer === null && !a.isSkipped),
  );

  const [current, setCurrent] = useState(initialIndex);
  const [startTime] = useState<Date | null>(() => new Date());
  const [isPending, startTransition] = useTransition();

  const [finalQuiz, setFinalQuiz] = useState<QuizWithAnswers | null>(null);
  const [retryPhase, setRetryPhase] = useState<RetryPhase>("idle");

  // Hook to prevent accidental navigation away from the quiz
  useBeforeUnload(!finalQuiz || retryPhase === "retrying");

  useEffect(() => {
    if (!api) {
      return;
    }

    // Listen for slide changes
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    onSelect(); // Call once to set the initial value
    api.on("select", onSelect);

    // Cleanup listener on component unmount
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const handleNext = useCallback(() => {
    if (api?.canScrollNext()) {
      api.scrollNext();
    } else {
      // This is the last question, finish the session.
      const now = new Date();
      const durationSeconds = startTime
        ? Math.floor((now.getTime() - startTime.getTime()) / 1000)
        : 0;

      const quizId = quiz.quizAnswers[0]?.quizId;

      if (quizId) {
        startTransition(async () => {
          const updatedResult = await logQuizResult(quizId, durationSeconds);
          if (updatedResult) {
            setFinalQuiz(updatedResult);
            // Check if retry should be offered
            const retryEligible = updatedResult.quizAnswers.filter(
              (a) => a.isWrong || a.isSkipped,
            );
            if (retryEligible.length === 0) {
              setRetryPhase("done");
              const audio = new Audio("/sounds/victory-fanfare.mp3");
              audio
                .play()
                .catch((err) => console.error("Audio play failed:", err));
              return;
            }
            if (settings?.allowRetry) {
              setRetryPhase("prompt");
            }
          }
        });
      } else {
        toast.error("Could not save quiz results. Quiz Log ID is missing.");
      }
    }
  }, [api, quiz.quizAnswers, startTime, settings?.allowRetry]);

  // --- Retry eligible answers (wrong + skipped from the completed quiz) ---
  const retryAnswers =
    finalQuiz?.quizAnswers
      .filter((a) => a.isWrong || a.isSkipped)
      .map((a) => ({
        ...a,
        userAnswer: null,
      })) ?? [];

  const handleAcceptRetry = () => {
    setRetryPhase("retrying");
  };

  const handleDeclineRetry = () => {
    setRetryPhase("done");
    const audio = new Audio("/sounds/victory-fanfare.mp3");
    audio.play().catch((err) => console.error("Audio play failed:", err));
  };

  const handleRetryComplete = () => {
    setRetryPhase("done");
    const audio = new Audio("/sounds/victory-fanfare.mp3");
    audio.play().catch((err) => console.error("Audio play failed:", err));
  };

  // --- Render: retry round ---
  if (retryPhase === "retrying" && retryAnswers.length > 0) {
    return (
      <RetryCarousel
        retryAnswers={retryAnswers}
        onRetryComplete={handleRetryComplete}
      />
    );
  }

  // --- Render: quiz summary (after retry or when declined) ---
  if (finalQuiz && retryPhase === "done") {
    return <QuizSummary quiz={finalQuiz} />;
  }

  if (quiz.quizAnswers.length === 0) return null;

  return (
    <div className="h-full space-y-1 flex flex-col">
      {/* Retry prompt dialog — shown over the summary while phase === "prompt" */}
      {retryPhase === "prompt" && finalQuiz && (
        <AlertDialog open>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <RotateCcw className="text-primary-2" width={20} />
                Retry Missed Questions?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                You have{" "}
                {retryAnswers.filter((a) => a.isWrong).length > 0 && (
                  <>
                    <span className="text-red-500 font-semibold">
                      {retryAnswers.filter((a) => a.isWrong).length} wrong
                    </span>
                  </>
                )}
                {retryAnswers.filter((a) => a.isWrong).length > 0 &&
                  retryAnswers.filter((a) => a.isSkipped).length > 0 &&
                  " and "}
                {retryAnswers.filter((a) => a.isSkipped).length > 0 && (
                  <>
                    <span className="text-gray-500 font-semibold">
                      {retryAnswers.filter((a) => a.isSkipped).length} skipped
                    </span>
                  </>
                )}{" "}
                question{retryAnswers.length !== 1 ? "s" : ""}.
              </div>
              <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-md p-2">
                ℹ️ Retry results won&apos;t affect your original score — no time
                limit applies.
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDeclineRetry}
              >
                <X width={14} />
                No, skip
              </Button>
              <Button
                className="flex-1"
                variant={"default"}
                onClick={handleAcceptRetry}
              >
                <RotateCcw width={14} />
                Yes, retry them
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* The AlertDialog is not needed as useBeforeUnload handles browser-native prompts */}
      <div className="flex gap-1">
        {quiz.quizAnswers.map((_, index) => (
          <div
            key={index}
            className={cn("h-1 rounded-full flex-1", {
              "bg-primary/90": index === current,
              "bg-muted": index !== current,
            })}
          ></div>
        ))}
      </div>
      <Carousel
        className="flex-1 h-full"
        setApi={setApi}
        opts={{ watchDrag: false, startIndex: initialIndex }}
      >
        <CarouselContent className="h-full">
          {quiz.quizAnswers.map((answer, index) => (
            <CarouselItem key={answer.id} className="h-full">
              <QuestionCard
                answerId={answer.id}
                question={answer.quizQuestion}
                initialIsCorrect={answer.isCorrect}
                onNext={handleNext}
                currentIndex={index}
                isActive={current === index}
                totalQuestions={quiz.quizAnswers.length}
                isFinalizing={isPending}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default QuizCarousel;
