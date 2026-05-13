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
import { QuizAnswerWithQuestion, QuizWithAnswers } from "@/lib/type";

const QuizCarousel = ({ quiz }: { quiz: QuizWithAnswers }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [startTime] = useState(new Date());
  const [isPending, startTransition] = useTransition();

  // State to hold the questions with user answers
  const [currentAnswers, setCurrentAnswers] = useState<
    QuizAnswerWithQuestion[]
  >(quiz.quizAnswers);
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

  // Find the first unanswered question to set as the starting point for resumed sessions
  const [initialIndex] = useState(() => {
    const start = currentAnswers.findIndex(
      (a) => a.userAnswer === null && !a.isSkipped,
    );
    return start === -1 ? 0 : start;
  });

  const handleAnswered = (answerId: string, userAnswer: string | null) => {
    // Call the server action to update the database in the background
    startTransition(async () => {
      const result = await updateQuizAnswer(answerId, userAnswer);
      if (result) {
        // Play audio feedback if the user didn't skip the question
        if (userAnswer !== null) {
          const audio = new Audio(
            result.isCorrect
              ? "/sounds/correct-answer-sound.mp3"
              : "/sounds/wrong-answer-sound.mp3",
          );
          audio.play().catch((err) => console.error("Audio play failed:", err));
        }

        setCurrentAnswers((prev) =>
          prev.map((a) =>
            a.id === answerId
              ? {
                  ...a,
                  userAnswer,
                  isCorrect: result.isCorrect,
                  quizQuestion: {
                    ...a.quizQuestion,
                    answer: result.correctAnswer,
                  },
                }
              : a,
          ),
        );
      }
    });
  };

  const handleNext = () => {
    if (api?.canScrollNext()) {
      api.scrollNext();
    } else {
      // This is the last question, finish the session.
      const durationSeconds = Math.floor(
        (new Date().getTime() - startTime.getTime()) / 1000,
      );
      const quizId = currentAnswers[0]?.quizId;

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
  };

  if (finalQuiz) {
    return <QuizSummary quiz={finalQuiz} />;
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
        opts={{ watchDrag: false, startIndex: initialIndex }}
      >
        <CarouselContent className="h-full">
          {currentAnswers.map((answer, index) => (
            <CarouselItem key={answer.id} className="h-full">
              <QuestionCard
                question={answer.quizQuestion}
                onAnswer={(userAnswer) => handleAnswered(answer.id, userAnswer)}
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
