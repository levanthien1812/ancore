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
  Calendar,
  Clock,
  EllipsisIcon,
  PenIcon,
  RefreshCcw,
  Star,
  Volume2Icon,
} from "lucide-react";
import { Popover, PopoverContent } from "../ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import AddWord from "../add-word/add-word";
import { formatPronunciation } from "@/lib/utils/pronunciation";
import { handlePlayAudio } from "@/lib/utils/handlePlayAudio";
import IconDisplay from "../shared/icon-display";
import { useMutation, useQuery } from "@tanstack/react-query";
import { updateWord } from "@/lib/actions/word.actions";
import { getReviewInfo } from "@/lib/actions/review.actions";
import { WordReviewInfo } from "@/lib/constants/enums";
import { format } from "date-fns";
import { Skeleton } from "../ui/skeleton";

const WordDetail = ({ word }: { word: WordWithMeanings }) => {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [current, setCurrent] = useState(0);

  const { mutate: updateWordMutation, isPending: isUpdating } = useMutation({
    mutationKey: ["update-word"],
    mutationFn: async (payload: Partial<WordWithMeanings>) => {
      await updateWord(word.id, payload);
    },
  });

  const { data: reviewInfo, isLoading } = useQuery<WordReviewInfo | null>({
    queryKey: ["review-info", word.id],
    queryFn: async () => {
      const response = await getReviewInfo(word.id);
      return response;
    },
  });

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
    <div className="overflow-x-hidden">
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
      </Carousel>

      {/* Skeleton */}

      <div className="mt-2 p-2 rounded-lg bg-blue-950 flex gap-2 justify-around">
        <div className="flex gap-2 md:gap-3 items-center">
          <Calendar width={24} height={24} className="text-blue-500" />
          <div className="space-y-1">
            <p className="text-white text-sm">Review in</p>
            {isLoading ? (
              <Skeleton className="h-6 w-[60px] bg-blue-800/50" />
            ) : (
              <p className="font-bold text-base text-white">
                {reviewInfo?.nextReviewIn} days
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 md:gap-3 items-center">
          <RefreshCcw width={24} height={24} className="text-blue-500" />
          <div className="space-y-1">
            <p className="text-white text-sm">Reviewed</p>
            {isLoading ? (
              <Skeleton className="h-6 w-[50px] bg-blue-800/50" />
            ) : (
              <p className="font-bold text-base text-white">
                {reviewInfo?.reviewedTimes} times
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 md:gap-3 items-center">
          <Clock width={24} height={24} className="text-blue-500" />
          <div className="space-y-1">
            <p className="text-white text-sm">Last Review</p>
            {isLoading ? (
              <Skeleton className="h-6 w-[80px] bg-blue-800/50" />
            ) : (
              <p className="font-bold text-base text-white">
                {reviewInfo?.lastReviewAt
                  ? format(reviewInfo.lastReviewAt, "dd/MM/yyyy")
                  : "--"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 flex gap-2 items-center">
        <button
          className={`me-auto flex gap-2 items-center text-sm py-1 px-2 ${word.highlighted ? "bg-yellow-600" : "border bg-white/10 hover:bg-white/20"} rounded-sm text-white cursor-pointer`}
          onClick={() => updateWordMutation({ highlighted: !word.highlighted })}
          disabled={isUpdating}
        >
          <Star width={14} height={14} color="yellow" fill="yellow" />{" "}
          {word.highlighted ? "Unfavorite" : "Favorite"}
        </button>
        {word.meanings.length > 1 && (
          <div className="flex gap-1">
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
      </div>
    </div>
  );
};

export default WordDetail;
