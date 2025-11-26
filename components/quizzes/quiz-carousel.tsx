"use client";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import QuestionCard from "./question-card";
import { QuizQuestion } from "@/lib/type";
import { cn } from "@/lib/utils";

const QuizCarousel = ({ questions }: { questions: QuizQuestion[] }) => {
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

  if (questions.length === 0) return null;
  return (
    <div>
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
      <Carousel className="mt-1" setApi={setApi}>
        <CarouselContent>
          {questions.map((question) => (
            <CarouselItem key={question.id}>
              <QuestionCard question={question} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default QuizCarousel;
