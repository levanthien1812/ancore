"use client";
import React, { useMemo, useState } from "react";
import { Badge } from "../ui/badge";
import { WordWithMeanings } from "../add-word/add-word-form";
import { Button } from "../ui/button";
import { CircleCheckBig, Lightbulb, Sun } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { buildReviewHintsPrompt } from "@/lib/ai-prompts/review-hints";
import { useSession } from "next-auth/react";
import { User, Word, WordMeaning } from "@/lib/generated/prisma/client";
import { updateReviewSession } from "@/lib/actions/review.actions";
import { ReviewPerformance } from "@/lib/constants/enums";
import { useCarousel } from "../ui/carousel";
import { PerformanceSummary } from "./review-carousel";

type Hint = Partial<
  Pick<Word, "tags"> &
    Pick<WordMeaning, "whenToUse" | "synonyms" | "exampleSentences">
>;
type HintLevel = keyof Hint;
type HintList = {
  field: HintLevel;
  value: Hint[HintLevel];
}[];

const FieldLabelMap: Record<HintLevel, string> = {
  tags: "Tags/Topics",
  whenToUse: "When to use",
  exampleSentences: "Example",
  synonyms: "Synonyms",
};

const INITIAL_HINT_LIST: HintList = [
  { field: "tags", value: "" },
  { field: "whenToUse", value: "" },
  { field: "exampleSentences", value: "" },
  { field: "synonyms", value: "" },
];

const FrontFace = ({
  word,
  setIsFlipped,
  onPerformanceUpdate,
}: {
  word: WordWithMeanings;
  setIsFlipped: (value: boolean) => void;
  onPerformanceUpdate: (performance: keyof PerformanceSummary) => void;
}) => {
  const [showHint, setShowHint] = React.useState(false);
  const [hintLevel, setHintLevel] = React.useState<HintLevel | null>(null);
  const [hintList, setHintList] = useState<HintList>(INITIAL_HINT_LIST);
  const { scrollNext, canScrollNext } = useCarousel();
  const session = useSession();

  const availableHints = useMemo(() => {
    const availableHints: Hint = {};
    if (word.tags) availableHints.tags = word.tags;
    if (word.meanings[0]?.whenToUse)
      availableHints.whenToUse = word.meanings[0]?.whenToUse;
    if (word.meanings[0]?.exampleSentences)
      availableHints.exampleSentences = word.meanings[0]?.exampleSentences
        .split("|")[0]
        .replace(word.word, "_____");
    if (word.meanings[0]?.synonyms)
      availableHints.synonyms = word.meanings[0]?.synonyms;
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
              session.data.user as User
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
      onSuccess: (data: Hint) => {
        setHintList(
          Object.keys(data).map((key) => ({
            field: key as HintLevel,
            value: data[key as HintLevel],
            label: FieldLabelMap[key as HintLevel],
          }))
        );
      },
    });

  const { isPending: isUpdatingReviewSession, mutate: reviewSessionMutate } =
    useMutation({
      mutationFn: async (performance: ReviewPerformance) => {
        const response = await updateReviewSession(word.id, performance);
        console.log(response);
      },
      mutationKey: ["updateReviewSession"],
    });

  const handleClickShowHint = () => {
    if (Object.keys(availableHints).length === 0) {
      getReviewHintsByAI();
      return;
    } else {
      const hints = Object.keys(availableHints).map((key) => ({
        field: key as HintLevel,
        value: availableHints[key as HintLevel],
      }));
      setHintLevel(hints[0].field);
      setHintList(hints);
    }
    setShowHint(true);
  };

  const handleClickMoreHints = () => {
    if (!hintLevel) return;

    const currentHintIndex = hintList.findIndex(
      (hint) => hint.field === hintLevel
    );
    const nextHintIndex = hintList.findIndex(
      (hint, index) => index > currentHintIndex && hint.value
    );
    if (nextHintIndex === -1) return;
    setHintLevel(hintList[nextHintIndex].field);
  };

  const handleForgotWord = () => {
    setShowHint(false);
    setHintLevel(null);
    reviewSessionMutate(ReviewPerformance.FORGOT);
    onPerformanceUpdate("Forgot");
    setIsFlipped(true);
  };

  const nextHintAvailable = useMemo(() => {
    if (!hintLevel) return false;
    if (Object.keys(availableHints).length === 0) return false;
    const currentHintIndex = hintList.findIndex(
      (hint) => hint.field === hintLevel
    );
    return hintList.some(
      (hint, index) => index > currentHintIndex && hint.value
    );
  }, [hintList, hintLevel, availableHints]);

  const handleClickMarkAsFamiliar = () => {
    switch (hintLevel) {
      case "tags":
        reviewSessionMutate(ReviewPerformance.GOOD);
        onPerformanceUpdate("Good");
        break;
      case "whenToUse":
        reviewSessionMutate(ReviewPerformance.MEDIUM);
        onPerformanceUpdate("Medium");
        break;
      case "exampleSentences":
      case "synonyms":
        reviewSessionMutate(ReviewPerformance.HARD);
        onPerformanceUpdate("Hard");
        break;
      default:
        reviewSessionMutate(ReviewPerformance.EASY);
        onPerformanceUpdate("Easy");
        break;
    }

    if (hintLevel) setIsFlipped(true);
    else scrollNext();
  };

  const currentHint = useMemo(() => {
    if (!hintLevel) return null;
    return hintList.find((hint) => hint.field === hintLevel);
  }, [hintLevel, hintList]);

  return (
    <div className="flex flex-col px-8 py-4 bg-primary h-full">
      <div className="grow flex flex-col justify-center">
        <Badge className="bg-primary-2 text-white">{word.cefrLevel}</Badge>
        <div className="text-[40px] font-bold mt-2 text-white">{word.word}</div>
      </div>
      <div className="flex justify-between">
        {Object.keys(availableHints).length > 0 && !showHint && (
          <Button
            className="border-2 border-white bg-transparent"
            onClick={handleClickShowHint}
          >
            <Lightbulb width={14} height={14} className="text-primary-2" />
            Need a hint?
          </Button>
        )}
        <Button
          className="border-2 border-white bg-transparent ms-auto"
          onClick={handleClickMarkAsFamiliar}
          disabled={isUpdatingReviewSession}
        >
          <CircleCheckBig width={14} height={14} className="text-green-500" />
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
            {FieldLabelMap[currentHint.field]}:{" "}
            <span className="text-primary-2">{currentHint.value}</span>
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
            <Button
              onClick={handleForgotWord}
              variant={"link"}
              size={"sm"}
              className="ms-auto text-white bg-transparent"
              disabled={isUpdatingReviewSession}
            >
              I forgot this word.
            </Button>
          </div>
        </div>
      )}
      {isGettingReviewHintsByAI && (
        <div className="mt-2">
          <p className="text-sm text-center text-white">Getting hints...</p>
        </div>
      )}
    </div>
  );
};

export default FrontFace;
