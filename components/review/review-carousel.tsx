"use client";
import ReviewWordCard from "@/components/review/review-word-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { WordWithMeanings } from "../add-word/add-word-form";
import { useEffect, useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { logWordReview, startStudySession } from "@/lib/actions/review.actions";
import { handlePlayAudio } from "@/lib/utils/handlePlayAudio";
import { Button } from "../ui/button";
import ReviewSummary from "./review-summary";
import { StudySessionWithWordReviews } from "@/lib/type";
import { ReviewPerformance } from "@prisma/client";
import { useLayout } from "../layout/layout-context";

const ReviewCarousel = ({
  words,
  onReviewMore,
}: {
  words: WordWithMeanings[];
  onReviewMore: () => void;
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [startTime] = useState(new Date());
  const [isPending, startTransition] = useTransition();
  const [sessionFinished, setSessionFinished] = useState(false);
  const [studySessionId, setStudySessionId] = useState<string | null>(null);
  const [studySession, setStudySession] =
    useState<StudySessionWithWordReviews | null>(null);
  const { settings } = useLayout();
  const [reviewQueue, setReviewQueue] = useState(words);

  useEffect(() => {
    const initLog = async () => {
      const id = await startStudySession();
      if (typeof id === "string") {
        setStudySessionId(id);
      }
    };
    initLog();
  }, []);

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

  // Play pronunciation audio whenever the current word changes
  useEffect(() => {
    if (reviewQueue[current] && !sessionFinished) {
      handlePlayAudio(
        reviewQueue[current].word,
        settings?.autoPlayPronunciation,
      );
    }
  }, [current, reviewQueue, sessionFinished, settings?.autoPlayPronunciation]);

  const handlePerformanceUpdate = (performance: ReviewPerformance) => {
    const currentWord = reviewQueue[current];
    if (!currentWord) return;

    const isForgotten = performance === ReviewPerformance.Forgot;
    // Only allow words from the original batch to be re-queued.
    // This ensures that "extra" words are only shown once, even if forgotten again.
    const isOriginalWord = current < words.length;
    const shouldRepeat =
      isForgotten && settings?.autoRepeatForgottenWords && isOriginalWord;

    if (shouldRepeat) {
      setReviewQueue((prev) => [...prev, currentWord]);
    }
  };

  const handleFinishSession = () => {
    const durationSeconds = Math.floor(
      (new Date().getTime() - startTime.getTime()) / 1000,
    );
    startTransition(async () => {
      if (studySessionId) {
        const studySession = await logWordReview(studySessionId, {
          durationSeconds,
        });
        setStudySession(studySession);
      }

      const audio = new Audio("/sounds/applause-sound.mp3");
      audio.play().catch((err) => console.error("Audio play failed:", err));

      setSessionFinished(true);
    });
  };

  const isAllWordsReviewed = useMemo(() => {
    return current + 1 === reviewQueue.length;
  }, [current, reviewQueue]);

  if (sessionFinished && studySession) {
    return (
      <ReviewSummary studySession={studySession} onReviewMore={onReviewMore} />
    );
  }
  if (words.length === 0) return null;

  return (
    <div className="relative h-full">
      <div className="flex gap-1">
        {reviewQueue.map((word, index) => (
          <div
            key={`${word.id}-${index}`}
            className={cn("h-1 rounded-full flex-1", {
              "bg-primary/90": index === current,
              "bg-muted": index !== current,
            })}
          ></div>
        ))}
      </div>
      <Carousel
        className="mt-1 h-full"
        setApi={setApi}
        opts={{ watchDrag: false }}
      >
        <CarouselContent className="h-full">
          {reviewQueue.map((word, index) => (
            <CarouselItem key={`${word.id}-${index}`} className="h-full">
              <ReviewWordCard
                word={word}
                onPerformanceUpdate={handlePerformanceUpdate}
                studySessionId={studySessionId ?? undefined}
                isRepeated={index + 1 > words.length}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* <CarouselNext />
        <CarouselPrevious /> */}
      </Carousel>
      <div className="mt-4 px-8 flex justify-center absolute top-0 right-0 gap-2 items-center w-full">
        <p className="text-white text-sm">
          {current + 1} of {reviewQueue.length}
        </p>
        {isAllWordsReviewed && (
          <Button
            onClick={handleFinishSession}
            isLoading={isPending}
            variant="outline"
            size={"sm"}
          >
            {isPending ? "Saving..." : "Finish Session"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReviewCarousel;
