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

const QuizCarousel = ({ quiz }: { quiz: QuizWithAnswers }) => {
  const [api, setApi] = useState<CarouselApi>();

  // Find the first unanswered question to set as the starting point for resumed sessions
  const initialIndex = Math.max(
    0,
    quiz.quizAnswers.findIndex((a) => a.userAnswer === null && !a.isSkipped),
  );

  const [current, setCurrent] = useState(initialIndex);
  const [startTime] = useState<Date | null>(() => new Date());
  const [isPending, startTransition] = useTransition();

  const [finalQuiz, setFinalQuiz] = useState<QuizWithAnswers | null>(null);

  // Hook to prevent accidental navigation away from the quiz
  useBeforeUnload(!finalQuiz);

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
          }
        });
      } else {
        toast.error("Could not save quiz results. Quiz Log ID is missing.");
      }
    }
  }, [api, quiz.quizAnswers, startTime]);

  if (finalQuiz) {
    return <QuizSummary quiz={finalQuiz} />;
  }

  if (quiz.quizAnswers.length === 0) return null;
  return (
    <div className="h-full space-y-1 flex flex-col">
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
