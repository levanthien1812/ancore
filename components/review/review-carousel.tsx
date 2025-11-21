"use client";
import ReviewWordCard from "@/components/review/review-word-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import { WordWithMeanings } from "../add-word/add-word-form";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ReviewCarousel = ({ words }: { words: WordWithMeanings[] }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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

  if (words.length === 0) return null;

  return (
    <div>
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
              <ReviewWordCard word={word} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
        <CarouselPrevious />
      </Carousel>
    </div>
  );
};

export default ReviewCarousel;
