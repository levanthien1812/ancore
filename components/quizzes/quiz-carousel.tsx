"use client";
import { useEffect, useState, useTransition } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import QuestionCard from "./question-card";
import { cn } from "@/lib/utils";
import { logQuizResult, updateQuizAnswer } from "@/lib/actions/quiz.actions";
import QuizSummary from "./quiz-summary";
import { toast } from "sonner";
import { useBeforeUnload } from "@/lib/hooks/use-before-unload";
import { QuizAnswerWithQuestion, QuizLogWithAnswers } from "@/lib/type";

const QuizCarousel = ({ quizzesLog }: { quizzesLog: QuizLogWithAnswers }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [startTime] = useState(new Date());
  const [isPending, startTransition] = useTransition();

  // State to hold the questions with user answers
  const [currentAnswers, setCurrentAnswers] = useState<
    QuizAnswerWithQuestion[]
  >(quizzesLog.quizAnswers);
  const [finalQuizLog, setFinalQuizLog] = useState<QuizLogWithAnswers | null>(
    null,
  );

  // Hook to prevent accidental navigation away from the quiz
  useBeforeUnload(!finalQuizLog);

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

  const handleAnswered = (
    answerId: string,
    userAnswer: string | null,
    isSkipped: boolean = false,
  ) => {
    // Call the server action to update the database in the background
    startTransition(async () => {
      const result = await updateQuizAnswer(answerId, userAnswer, isSkipped);
      if (result) {
        setCurrentAnswers((prev) =>
          prev.map((a) =>
            a.id === answerId
              ? {
                  ...a,
                  userAnswer,
                  isCorrect: result.isCorrect,
                  isSkipped,
                }
              : a,
          ),
        );
      }
    });
  };

  const handleNext = () => {
    const currentAnswer = currentAnswers[current];

    // If user clicks next/skip without answering, mark it as an explicit skip in the DB
    if (currentAnswer.userAnswer === null && !currentAnswer.isSkipped) {
      handleAnswered(currentAnswer.id, null, true);
    }

    if (api?.canScrollNext()) {
      api.scrollNext();
    } else {
      // This is the last question, finish the session.
      const durationSeconds = Math.floor(
        (new Date().getTime() - startTime.getTime()) / 1000,
      );
      const quizLogId = currentAnswers[0]?.quizzesLogId;

      if (quizLogId) {
        startTransition(async () => {
          const updatedResult = await logQuizResult(quizLogId, durationSeconds);
          if (updatedResult) {
            setFinalQuizLog(updatedResult);
          }
        });
      } else {
        toast.error("Could not save quiz results. Quiz Log ID is missing.");
      }
    }
  };

  if (finalQuizLog) {
    return <QuizSummary quizzesLog={finalQuizLog} />;
  }

  if (currentAnswers.length === 0) return null;
  return (
    <div className="h-full space-y-1 flex flex-col">
      {/* The AlertDialog is not needed as useBeforeUnload handles browser-native prompts */}
      <div className="flex gap-1">
        {currentAnswers.map((_, index) => (
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
        opts={{ watchDrag: false }}
      >
        <CarouselContent className="h-full">
          {currentAnswers.map((answer, index) => (
            <CarouselItem key={answer.id} className="h-full">
              <QuestionCard
                question={answer.quizQuestion}
                onAnswer={(userAnswer, isSkipped) =>
                  handleAnswered(answer.id, userAnswer, isSkipped)
                }
                isCorrect={answer.isCorrect}
                onNext={handleNext}
                currentIndex={index}
                totalQuestions={currentAnswers.length}
                isSubmitting={isPending}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default QuizCarousel;
