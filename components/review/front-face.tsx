"use client";
import React, { useMemo, useState } from "react";
import { Badge } from "../ui/badge";
import { WordWithMeanings } from "../add-word/add-word-form";
import { Button } from "../ui/button";
import {
  ChevronsRight,
  CircleCheckBig,
  Clock3,
  FlipHorizontal2,
  Lightbulb,
  Sun,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { buildReviewHintsPrompt } from "@/lib/ai-prompts/review-hints";
import { useSession } from "next-auth/react";
import { ReviewPerformance, User, WordMeaning } from "@prisma/client";
import { updateWordReview } from "@/lib/actions/review.actions";
import { useCarousel } from "../ui/carousel";
import { normalizeText } from "@/lib/utils/normalize-text";
import PartsOfSpeech from "../word-list/parts-of-speech";
import {
  getDistinctCefrLevels,
  getDistinctPartsOfSpeech,
  getDistinctPronunciations,
} from "@/lib/utils/get-distinct-values";
import { MAXIMUM_EXAMPLES_IN_HINTS } from "@/lib/constants/constant";

type Hint = Partial<
  Pick<WordMeaning, "synonyms" | "antonyms" | "examples" | "guideWord">
>;
type HintLevel = keyof Hint;
type HintList = {
  field: HintLevel;
  value: Hint[HintLevel];
  label?: string;
}[];

const FieldLabelMap: Record<HintLevel, string> = {
  guideWord: "Guide word",
  examples: "Example",
  synonyms: "Synonyms",
  antonyms: "Antonyms",
};

const INITIAL_HINT_LIST: HintList = [
  { field: "guideWord", value: "" },
  { field: "examples", value: "" },
  { field: "synonyms", value: "" },
  { field: "antonyms", value: "" },
];

const FrontFace = ({
  word,
  setIsFlipped,
  onPerformanceUpdate,
  studySessionId,
  isRepeated,
}: {
  word: WordWithMeanings;
  setIsFlipped: (value: boolean) => void;
  onPerformanceUpdate: (performance: ReviewPerformance) => void;
  studySessionId?: string;
  isRepeated?: boolean;
}) => {
  const [showHint, setShowHint] = React.useState(false);
  const [hintLevel, setHintLevel] = React.useState<HintLevel | null>(null);
  const [hintList, setHintList] = useState<HintList>(INITIAL_HINT_LIST);
  const { scrollNext, canScrollNext } = useCarousel();
  const [isReviewed, setIsReviewed] = useState(false);
  const session = useSession();

  const availableHints = useMemo(() => {
    const availableHints: Hint = {};
    const primaryMeaning = word.meanings[0];
    if (primaryMeaning?.guideWord && primaryMeaning.guideWord.length > 0)
      availableHints.guideWord = primaryMeaning?.guideWord;
    if (primaryMeaning?.examples && primaryMeaning.examples.length > 0)
      availableHints.examples = primaryMeaning?.examples
        .filter((x) => x.trim().length > 0)
        .slice(0, MAXIMUM_EXAMPLES_IN_HINTS);
    if (primaryMeaning?.synonyms && primaryMeaning.synonyms.length > 0)
      availableHints.synonyms = primaryMeaning?.synonyms;
    if (primaryMeaning?.antonyms && primaryMeaning.antonyms.length > 0)
      availableHints.antonyms = primaryMeaning?.antonyms;
    return availableHints;
  }, [word]);

  const { mutate: getReviewHintsByAI, isPending: isGettingReviewHintsByAI } =
    useMutation({
      mutationFn: async () => {
        if (!session.data) return;
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: buildReviewHintsPrompt(
              word.word,
              session.data.user as User,
            ),
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const result = JSON.parse(data.result);
          return result;
        }
      },
      mutationKey: ["reviewHints"],
      onSuccess: (data: Hint | undefined) => {
        if (!data) return;
        const hints = Object.keys(data).map((key) => ({
          field: key as HintLevel,
          value: data[key as HintLevel],
          label: FieldLabelMap[key as HintLevel],
        }));
        setHintList(hints);
        if (hints.length > 0) {
          setHintLevel(hints[0].field);
          setShowHint(true);
        }
      },
    });

  const { isPending: isUpdatingWordReview, mutate: wordReviewMutate } =
    useMutation({
      mutationFn: async (performance: ReviewPerformance) => {
        await updateWordReview(word.id, performance, studySessionId);
      },
      mutationKey: ["updateWordReview"],
    });

  const handleClickShowHint = () => {
    if (Object.keys(availableHints).length === 0) {
      getReviewHintsByAI();
      return;
    } else {
      const hints = Object.keys(availableHints).map((key) => ({
        field: key as HintLevel,
        value: availableHints[key as HintLevel],
        label: FieldLabelMap[key as HintLevel],
      }));
      setHintLevel(hints[0].field);
      setHintList(hints);
    }
    setShowHint(true);
  };

  const handleClickMoreHints = () => {
    if (!hintLevel) return;

    const currentHintIndex = hintList.findIndex(
      (hint) => hint.field === hintLevel,
    );
    const nextHintIndex = hintList.findIndex(
      (hint, index) => index > currentHintIndex && hint.value,
    );
    if (nextHintIndex === -1) return;
    setHintLevel(hintList[nextHintIndex].field);
  };

  const handleForgotWord = () => {
    setShowHint(false);
    setHintLevel(null);
    wordReviewMutate(ReviewPerformance.Forgot);
    onPerformanceUpdate("Forgot");
    setIsReviewed(true);
    setIsFlipped(true);
  };

  const nextHintAvailable = useMemo(() => {
    if (!hintLevel) return false;
    if (Object.keys(availableHints).length === 0) return false;
    const currentHintIndex = hintList.findIndex(
      (hint) => hint.field === hintLevel,
    );
    return hintList.some(
      (hint, index) => index > currentHintIndex && hint.value,
    );
  }, [hintList, hintLevel, availableHints]);

  const handleClickMarkAsFamiliar = () => {
    switch (hintLevel) {
      case "guideWord":
        wordReviewMutate(ReviewPerformance.Good);
        onPerformanceUpdate("Good");
        break;
      case "synonyms":
      case "antonyms":
        wordReviewMutate(ReviewPerformance.Medium);
        onPerformanceUpdate("Medium");
        break;
      case "examples":
        wordReviewMutate(ReviewPerformance.Hard);
        onPerformanceUpdate("Hard");
        break;
      default:
        wordReviewMutate(ReviewPerformance.Easy);
        onPerformanceUpdate("Easy");
        break;
    }
    setIsReviewed(true);
    if (hintLevel) setIsFlipped(true);
    else scrollNext();
  };

  const handleClickNeedMorePractice = () => {
    wordReviewMutate(ReviewPerformance.Medium);
    onPerformanceUpdate("Medium");
    setIsReviewed(true);
    setIsFlipped(true);
  };

  const currentHint = useMemo(() => {
    if (!hintLevel) return null;
    return hintList.find((hint) => hint.field === hintLevel);
  }, [hintLevel, hintList]);

  const distinctPartsOfSpeech = useMemo(
    () => getDistinctPartsOfSpeech(word),
    [word],
  );
  const distinctCefrLevels = useMemo(() => getDistinctCefrLevels(word), [word]);
  const distinctPronunciations = useMemo(
    () => getDistinctPronunciations(word),
    [word],
  );

  return (
    <div className="flex flex-col px-4 sm:px-8 py-4 bg-primary rounded-2xl h-full">
      <div className="grow flex flex-col justify-center items-center">
        <div className="flex gap-2">
          {distinctCefrLevels.length > 0 &&
            distinctCefrLevels.map((level) => (
              <Badge key={level} className="bg-primary-2 text-white">
                {level}
              </Badge>
            ))}
        </div>
        <div className="text-[40px] font-bold mt-2 text-white text-center">
          {word.word}
        </div>
        {distinctPartsOfSpeech.length > 0 && (
          <PartsOfSpeech
            uniquePos={distinctPartsOfSpeech}
            wordType={word.type as string}
          />
        )}
        {distinctPronunciations.length > 0 && (
          <div className="text-sm text-white/80 mt-1 text-center">
            {distinctPronunciations.join(", ")}
          </div>
        )}
      </div>
      {!isReviewed && !isRepeated && (
        <>
          {Object.keys(availableHints).length > 0 && !showHint && (
            <Button
              className="text-white"
              onClick={handleClickShowHint}
              variant={"link"}
            >
              <Lightbulb width={16} height={16} className="text-primary-2" />
              Need a hint?
            </Button>
          )}
          <div className="flex justify-between gap-2 ">
            <Button
              className="border border-white bg-transparent hover:bg-white/10 flex-1"
              onClick={handleClickNeedMorePractice}
              disabled={isUpdatingWordReview}
            >
              <Clock3 width={16} height={16} className="text-yellow-500" />
              Needs more practice
            </Button>
            <Button
              className="border border-white bg-transparent hover:bg-white/10 flex-1"
              onClick={handleClickMarkAsFamiliar}
              disabled={isUpdatingWordReview}
            >
              <CircleCheckBig
                width={16}
                height={16}
                className="text-green-500"
              />
              Mark as familiar
            </Button>
          </div>
          {showHint && currentHint && (
            <div className="border-2 rounded-xl bg-transparent p-4 mt-2">
              <div className="font-bold text-white flex items-center gap-2">
                <Sun width={20} height={20} className="text-primary-2" />{" "}
                <span className="underline">Hint</span>
              </div>
              <div key={currentHint.field} className="text-white mt-2">
                {currentHint.label}:{" "}
                {(currentHint.field === "guideWord" ||
                  currentHint.field === "synonyms" ||
                  currentHint.field === "antonyms") && (
                  <span className="text-primary-2 text-sm">
                    {currentHint.value}
                  </span>
                )}
                {currentHint.field === "examples" && (
                  <ul className="text-primary-2 text-sm list-disc list-inside">
                    {(currentHint.value as string[]).map((example, index) => (
                      <li key={index}>{normalizeText(example)}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex gap-2 items-end mt-3">
                {nextHintAvailable && (
                  <Button
                    onClick={handleClickMoreHints}
                    variant={"outline"}
                    size={"sm"}
                  >
                    Still need more hints?
                  </Button>
                )}
              </div>
            </div>
          )}
          {isGettingReviewHintsByAI && (
            <div className="mt-2">
              <p className="text-sm text-center text-white">Getting hints...</p>
            </div>
          )}
          <Button
            onClick={handleForgotWord}
            variant={"link"}
            size={"sm"}
            className="mx-auto text-white bg-transparent mt-2"
            disabled={isUpdatingWordReview}
          >
            I forgot this word.
          </Button>
        </>
      )}
      {isRepeated && (
        <div className="flex justify-between gap-2 ">
          <Button
            className="border border-white bg-transparent hover:bg-white/10 flex-1"
            onClick={() => setIsFlipped(true)}
          >
            <FlipHorizontal2
              width={16}
              height={16}
              className="text-yellow-500"
            />
            Flip
          </Button>
          {canScrollNext && (
            <Button
              onClick={() => scrollNext()}
              className="border border-white bg-transparent hover:bg-white/10 flex-1"
            >
              Next Word{" "}
              <ChevronsRight
                width={16}
                height={16}
                className="text-primary-2"
              />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FrontFace;
