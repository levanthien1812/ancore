"use client";
import ReviewWordCard from "@/components/review/review-word-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { WordWithMeanings } from "../add-word/add-word-form";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { logReviewSession } from "@/lib/actions/review.actions";
import { Button } from "../ui/button";
import ReviewSummary from "./review-summary";

export type PerformanceSummary = {
  Forgot: string[];
  Hard: string[];
  Medium: string[];
  Good: string[];
  Easy: string[];
};

const ReviewCarousel = ({ words }: { words: WordWithMeanings[] }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [startTime] = useState(new Date());
  const [isPending, startTransition] = useTransition();
  const [sessionFinished, setSessionFinished] = useState(false);
  const [summary, setSummary] = useState<PerformanceSummary>({
    Forgot: [],
    Hard: [],
    Medium: [],
    Good: [],
    Easy: [],
  });

  useEffect(() => {
    if (!api) {
      return;
    }

    // Set initial value
    const updateCurrent = () => {
      setCurrent(api.selectedScrollSnap());
    };

    updateCurrent();

    // Listen for slide changes
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);

    // Cleanup listener on component unmount
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const handlePerformanceUpdate = (performance: keyof PerformanceSummary) => {
    const currentWord = words[current];
    if (!currentWord) return;

    setSummary((prev) => ({
      ...prev,
      [performance]: [...prev[performance], currentWord.word],
    }));
  };

  const handleFinishSession = () => {
    const durationSeconds = Math.floor(
      (new Date().getTime() - startTime.getTime()) / 1000
    );
    startTransition(async () => {
      const performanceSummaryForLog = Object.entries(summary).reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string[]>
      );
      await logReviewSession({
        durationSeconds,
        performanceSummary: performanceSummaryForLog,
      });
      setSessionFinished(true);
    });
  };

  if (sessionFinished) {
    return <ReviewSummary summary={summary} />;
  }
  if (words.length === 0) return null;

  return (
    <div className="relative">
      <div className="flex gap-1">
        {words.map((word, index) => (
          <div
            key={word.id}
            className={cn("h-1 rounded-full flex-1", {
              "bg-primary/90": index === current,
              "bg-muted": index !== current,
            })}
          ></div>
        ))}
      </div>
      <Carousel className="mt-1" setApi={setApi}>
        <CarouselContent>
          {words.map((word) => (
            <CarouselItem key={word.id}>
              <ReviewWordCard
                word={word}
                onPerformanceUpdate={handlePerformanceUpdate}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* <CarouselNext />
        <CarouselPrevious /> */}
      </Carousel>
      {current === words.length - 1 && (
        <div className="mt-4 flex justify-center px-2 absolute top-0 right-0">
          <Button
            onClick={handleFinishSession}
            disabled={isPending}
            variant="outline"
          >
            {isPending ? "Saving..." : "Finish Session"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewCarousel;
