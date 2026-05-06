"use client";
import { WordWithMeanings } from "../add-word/add-word-form";
import WordMeaning from "./word-meaning";
import { Badge } from "../ui/badge";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  ArrowLeft,
  ArrowRight,
  EllipsisIcon,
  PenIcon,
  Star,
  Volume2Icon,
} from "lucide-react";
import { Popover, PopoverContent } from "../ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import AddWord from "../add-word/add-word";
import { formatPronunciation } from "@/lib/utils/pronunciation";
import { handlePlayAudio } from "@/lib/utils/handlePlayAudio";
import IconDisplay from "../shared/icon-display";

const WordDetail = ({ word }: { word: WordWithMeanings }) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [current, setCurrent] = useState(0);

  // Sync button disabled state when carousel initializes or changes
  useEffect(() => {
    if (!api) return;

    const updateButtons = () => {
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
      setCurrent(api.selectedScrollSnap());
    };

    updateButtons();
    api.on("select", updateButtons);
    api.on("reInit", updateButtons);

    return () => {
      api.off("select", updateButtons);
      api.off("reInit", updateButtons);
    };
  }, [api]);

  const currentMeaning = word.meanings[current];

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          {currentMeaning?.cefrLevel && (
            <Badge className="bg-primary-2 text-white">
              {currentMeaning?.cefrLevel}
            </Badge>
          )}
          <div className="text-4xl font-bold text-white whitespace-nowrap">
            {word.word}
          </div>
        </div>
        <div className="flex gap-1 justify-end">
          <IconDisplay
            icon={Volume2Icon}
            asButton
            onClick={() => handlePlayAudio(word.word)}
          />
          <AddWord
            word={word}
            triggerButton={<IconDisplay icon={PenIcon} asButton />}
          />

          <Popover>
            <PopoverTrigger asChild>
              <IconDisplay icon={EllipsisIcon} asButton />
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0">
              <div>
                <Button variant={"link"}>Delete</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <p className="text-sm text-white">
        {formatPronunciation(currentMeaning?.pronunciation)}
      </p>

      <Carousel setApi={setApi} className="w-full mt-4">
        <CarouselContent>
          {word.meanings.map((meaning) => (
            <CarouselItem key={meaning.id}>
              <WordMeaning meaning={meaning} word={word.word} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {word.meanings.length > 1 && (
          <div className="flex gap-1 mt-2">
            <button className="me-auto flex gap-2 items-center text-sm py-1 px-2 border rounded-sm bg-white/10 text-white cursor-pointer hover:bg-white/20">
              <Star width={14} height={14} color="yellow" fill="yellow" />{" "}
              Favorite
            </button>
            <IconDisplay
              asButton
              icon={ArrowLeft}
              onClick={() => api?.scrollPrev()}
              disabled={!canPrev}
            />
            <IconDisplay
              asButton
              icon={ArrowRight}
              onClick={() => api?.scrollNext()}
              disabled={!canNext}
            />
          </div>
        )}
      </Carousel>

      <div className="mt-2"></div>
    </div>
  );
};

export default WordDetail;
