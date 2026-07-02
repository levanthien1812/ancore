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
import { startTransition, useActionState, useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  EllipsisIcon,
  PenIcon,
  Plus,
  RefreshCcw,
  Volume2Icon,
} from "lucide-react";
import { Popover, PopoverContent } from "../ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import AddOrEditWord from "../add-word/add-word";
import { formatPronunciation } from "@/lib/utils/pronunciation";
import { handlePlayAudio } from "@/lib/utils/handlePlayAudio";
import IconDisplay from "../shared/icon-display";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteWords, updateWord } from "@/lib/actions/word.actions";
import { getReviewInfo } from "@/lib/actions/review.actions";
import { WordReviewInfo } from "@/lib/constants/enums";
import { format } from "date-fns";
import { Skeleton } from "../ui/skeleton";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import ConfirmActionDialog from "../shared/confirm-action-dialog";
import { toast } from "sonner";
import { INITIAL_ACTION_STATE } from "@/lib/constants/initial-values";
import { convertHoursToDaysHours } from "@/lib/utils/time-convert";
import ScrollContainer from "react-indiana-drag-scroll";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const [state, formAction, isDeleting] = useActionState(
    deleteWords,
    INITIAL_ACTION_STATE,
  );

  const { mutate: updateWordMutation, isPending: isUpdating } = useMutation({
    mutationKey: ["update-word"],
    mutationFn: async (payload: Partial<WordWithMeanings>) => {
      await updateWord(word.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_WORDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_RECENT_WORDS] });
      toast.success("Word updated");
    },
  });

  const { data: reviewInfo, isLoading: isLoadingReviewInfo } =
    useQuery<WordReviewInfo | null>({
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

  const handleDelete = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  // useEffect(() => {
  //   setCurrent(0)
  // }, [word])

  const currentMeaning = word.meanings[current];

  const reviewStatsItems = [
    {
      text: "Review in",
      value: `${convertHoursToDaysHours(reviewInfo?.nextReviewIn || 0)}`,
      icon: <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />,
      display: !!reviewInfo?.nextReviewIn && reviewInfo?.nextReviewIn >= 0,
    },
    {
      text: "Overdue",
      value: `${convertHoursToDaysHours(reviewInfo?.overdueIn || 0)}`,
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
      display: !!reviewInfo?.lastReviewAt,
    },
    {
      text: "Added At",
      value: word.createdAt ? format(word.createdAt, "dd/MM/yyyy") : "--",
      icon: <Plus className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" />,
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
            <AddOrEditWord
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
                <AddOrEditWord
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
                <ConfirmActionDialog
                  showDialog={showDeleteDialog}
                  setShowDialog={setShowDeleteDialog}
                  handleDelete={handleDelete}
                  title="Delete word"
                  message={`Are you sure you want to delete "${word.word}"?`}
                  isLoading={isDeleting}
                  triggerButton={
                    <Button variant={"link"} className="text-red-600">
                      Delete
                    </Button>
                  }
                  actionText="Delete"
                />
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
        <ScrollContainer className="mt-2 p-2 md:p-3 rounded-lg bg-blue-950 flex gap-2 justify-around">
          {reviewStatsItems.map((item, index) => (
            <div
              className={`${item.display ? "flex" : "hidden"} gap-2 md:gap-3 items-center min-w-[31%]`}
              key={index}
            >
              {item.icon}
              <div className="space-y-1">
                <p className="text-white text-xs sm:text-sm">{item.text}</p>
                {isLoadingReviewInfo ? (
                  <Skeleton className="h-6 w-[60px] bg-blue-800/50" />
                ) : (
                  <p className="font-bold leading-none text-base text-white">
                    {item.value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </ScrollContainer>
      )}
    </div>
  );
};

export default WordDetail;
