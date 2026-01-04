"use client";
import { WordWithMeanings } from "../add-word/add-word-form";
import WordMeaning from "./word-meaning";
import { Badge } from "../ui/badge";
import WordPronunciation from "../word-list/word-pronunciation";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, EllipsisIcon, PenIcon } from "lucide-react";
import { Popover, PopoverContent } from "../ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import AddWord from "../add-word/add-word";

const WordDetail = ({ word }: { word: WordWithMeanings }) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Sync button disabled state when carousel initializes or changes
  useEffect(() => {
    if (!api) return;

    const updateButtons = () => {
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };

    updateButtons();
    api.on("select", updateButtons);
    api.on("reInit", updateButtons);

    return () => {
      api.off("select", updateButtons);
      api.off("reInit", updateButtons);
    };
  }, [api]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Badge className="bg-primary-2 text-white">{word.cefrLevel}</Badge>
          <div className="text-4xl font-bold mt-2 text-white">{word.word}</div>
        </div>
        <div className="flex gap-1 justify-end">
          <AddWord
            word={word}
            triggerButton={
              <Button variant={"outline"} size={"icon"}>
                <PenIcon />
              </Button>
            }
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} size={"icon"}>
                <EllipsisIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0">
              <div>
                <Button variant={"link"}>Delete</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <WordPronunciation
        word={word.word}
        pronunciation={word.pronunciation}
        light={true}
      />

      <Carousel setApi={setApi} className="w-full mt-2">
        <CarouselContent>
          {word.meanings.map((meaning) => (
            <CarouselItem key={meaning.id}>
              <WordMeaning meaning={meaning} word={word.word} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {word.meanings.length > 1 && (
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size={"icon"}
              onClick={() => api?.scrollPrev()}
              disabled={!canPrev}
            >
              <ArrowLeft />
            </Button>

            <Button
              variant="outline"
              size={"icon"}
              onClick={() => api?.scrollNext()}
              disabled={!canNext}
            >
              <ArrowRight />
            </Button>
          </div>
        )}
      </Carousel>
    </div>
  );
};

export default WordDetail;
