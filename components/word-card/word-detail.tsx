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

const WordDetail = ({
  word,
  showReviewStats = true,
}: {
  word: WordWithMeanings;
  showReviewStats?: boolean;
}) => {
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
    enabled: showReviewStats,
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

  const reviewStatsItems = [
    {
      text: "Review in",
      value: `${reviewInfo?.nextReviewIn} days`,
      icon: <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />,
      display: !!reviewInfo?.nextReviewIn && reviewInfo?.nextReviewIn >= 0,
    },
    {
      text: "Overdue",
      value: `${reviewInfo?.overdueIn} days`,
      icon: <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />,
      display: !!reviewInfo?.overdueIn && reviewInfo?.overdueIn >= 0,
    },
    {
      text: "Reviewed",
      value: `${reviewInfo?.reviewedTimes} times`,
      icon: <RefreshCcw className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />,
      display: true,
    },
    {
      text: "Last Review",
      value: reviewInfo?.lastReviewAt
        ? format(reviewInfo.lastReviewAt, "dd/MM/yyyy")
        : "--",
      icon: <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />,
      display: true,
    },
  ];

  return (
    <div className="overflow-x-hidden">
      <div className="flex gap-2">
        <div className="space-y-1 flex-1">
          {currentMeaning?.cefrLevel && (
            <Badge className="bg-primary-2 text-white">
              {currentMeaning?.cefrLevel}
            </Badge>
          )}
          <div className="text-4xl font-bold text-white">{word.word}</div>
          {currentMeaning?.pronunciation && (
            <p className="text-sm text-white">
              {formatPronunciation(currentMeaning?.pronunciation)}
            </p>
          )}
        </div>
        <div className="flex gap-1 justify-end">
          <IconDisplay
            icon={Volume2Icon}
            asButton
            onClick={() => handlePlayAudio(word.word)}
            additionalClasses="hidden md:block"
          />
          <div className="hidden md:block">
            <AddWord
              word={word}
              triggerButton={<IconDisplay icon={PenIcon} asButton />}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <IconDisplay icon={EllipsisIcon} asButton />
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0">
              <div>
                <Button
                  variant={"link"}
                  onClick={() =>
                    updateWordMutation({ highlighted: !word.highlighted })
                  }
                  isLoading={isUpdating}
                >
                  {word.highlighted ? "Unfavorite" : "Add to Favorite"}
                </Button>
              </div>
              <div className="border-t block md:hidden">
                <AddWord
                  word={word}
                  triggerButton={<Button variant={"link"}>Edit</Button>}
                />
              </div>
              <div className="border-t block md:hidden">
                <Button
                  variant={"link"}
                  onClick={() => handlePlayAudio(word.word)}
                >
                  Play audio
                </Button>
              </div>
              <div className="border-t">
                <Button variant={"link"} className="text-red-600">
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Carousel setApi={setApi} className="w-full mt-2 md:mt-4 relative">
        <CarouselContent>
          {word.meanings.map((meaning) => (
            <CarouselItem key={meaning.id}>
              <WordMeaning meaning={meaning} word={word.word} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {word.meanings.length > 1 && (
          <div className="flex gap-1 absolute bottom-1 right-1">
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

      {/* Skeleton */}

      {showReviewStats && (
        <div className="mt-2 p-2 md:p-3 rounded-lg bg-blue-950 flex gap-2 justify-around">
          {reviewStatsItems.map((item, index) => (
            <div
              className={`${item.display ? "flex" : "hidden"} gap-2 md:gap-3 items-center`}
              key={index}
            >
              {item.icon}
              <div className="space-y-1">
                <p className="text-white text-xs sm:text-sm">{item.text}</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-[60px] bg-blue-800/50" />
                ) : (
                  <p className="font-bold leading-none text-base text-white">
                    {item.value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WordDetail;
