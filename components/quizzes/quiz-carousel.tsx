"use client";
import { useEffect, useState, useTransition } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import QuestionCard from "./question-card";
import { QuizQuestionWithWords } from "@/lib/type";
import { cn } from "@/lib/utils";
import { logQuizResult, updateQuizQuestion } from "@/lib/actions/quiz.actions";
import QuizSummary from "./quiz-summary";
import { toast } from "sonner";
import { useBeforeUnload } from "@/lib/hooks/use-before-unload";

const QuizCarousel = ({
  questions,
}: {
  questions: QuizQuestionWithWords[];
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [startTime] = useState(new Date());
  const [isPending, startTransition] = useTransition();

  // State to hold the questions with user answers
  const [answeredQuestions, setAnsweredQuestions] =
    useState<QuizQuestionWithWords[]>(questions);
  const [sessionFinished, setSessionFinished] = useState(false);

  // Hook to prevent accidental navigation away from the quiz
  useBeforeUnload(!sessionFinished);

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
    questionId: string,
    userAnswer: string,
    isCorrect: boolean
  ) => {
    // Update the local state for immediate UI feedback
    setAnsweredQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId ? { ...q, userAnswer, isCorrect } : q
      )
    );

    // Call the server action to update the database in the background
    startTransition(() =>
      updateQuizQuestion(questionId, userAnswer, isCorrect)
    );
  };

  const handleNext = () => {
    if (api?.canScrollNext()) {
      api.scrollNext();
    } else {
      // This is the last question, finish the session.
      const durationSeconds = Math.floor(
        (new Date().getTime() - startTime.getTime()) / 1000
      );
      const quizLogId = questions[0]?.quizzesLogId;

      if (quizLogId) {
        startTransition(async () => {
          await logQuizResult(quizLogId, durationSeconds);
          setSessionFinished(true);
        });
      } else {
        toast.error("Could not save quiz results. Quiz Log ID is missing.");
      }
    }
  };

  if (sessionFinished) {
    // Pass the final list of questions with answers to the summary
    return <QuizSummary questions={answeredQuestions} />;
  }
  if (questions.length === 0) return null;
  return (
    <div>
      {/* The AlertDialog is not needed as useBeforeUnload handles browser-native prompts */}
      <div className="flex gap-1">
        {questions.map(({ id }, index) => (
          <div
            key={id}
            className={cn("h-1 rounded-full flex-1", {
              "bg-primary/90": index === current,
              "bg-muted": index !== current,
            })}
          ></div>
        ))}
      </div>
      <Carousel className="mt-1" setApi={setApi} opts={{ watchDrag: false }}>
        <CarouselContent>
          {questions.map((question, index) => (
            <CarouselItem key={question.id}>
              <QuestionCard
                question={question}
                onAnswered={handleAnswered.bind(null, question.id)}
                onNext={handleNext}
                isLastQuestion={index === questions.length - 1}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default QuizCarousel;
