"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import QuestionCard from "./question-card";
import { cn } from "@/lib/utils";
import { QuizAnswerWithQuestion } from "@/lib/type";

const RetryCarousel = ({
  retryAnswers,
  onRetryComplete,
}: {
  retryAnswers: QuizAnswerWithQuestion[];
  onRetryComplete: () => void;
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const handleNext = useCallback(() => {
    if (api?.canScrollNext()) {
      api.scrollNext();
    } else {
      onRetryComplete();
    }
  }, [api, onRetryComplete]);

  if (retryAnswers.length === 0) return null;

  return (
    <div className="h-full space-y-1 flex flex-col">
      {/* Progress dots */}
      <div className="flex gap-1">
        {retryAnswers.map((_, index) => (
          <div
            key={index}
            className={cn("h-1 rounded-full flex-1", {
              "bg-primary-2": index === current,
              "bg-muted": index !== current,
            })}
          />
        ))}
      </div>

      {/* Retry label */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
          🔁 Retry Round — {retryAnswers.length} question{retryAnswers.length !== 1 ? "s" : ""}
        </span>
        <span className="text-xs text-muted-foreground">
          No time limit · Results don&apos;t affect your score
        </span>
      </div>

      <Carousel
        className="flex-1 h-full"
        setApi={setApi}
        opts={{ watchDrag: false, startIndex: 0 }}
      >
        <CarouselContent className="h-full">
          {retryAnswers.map((answer, index) => (
            <CarouselItem key={answer.id} className="h-full">
              <QuestionCard
                answerId={answer.id}
                question={answer.quizQuestion}
                initialIsCorrect={null}
                onNext={handleNext}
                currentIndex={index}
                isActive={current === index}
                totalQuestions={retryAnswers.length}
                isFinalizing={false}
                isRetryMode={true}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default RetryCarousel;
