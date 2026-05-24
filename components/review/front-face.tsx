"use client";
import React, { useMemo, useState } from "react";
import { Badge } from "../ui/badge";
import { WordWithMeanings } from "../add-word/add-word-form";
import { Button } from "../ui/button";
import { CircleCheckBig, Lightbulb, Sun } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { buildReviewHintsPrompt } from "@/lib/ai-prompts/review-hints";
import { useSession } from "next-auth/react";
import { ReviewPerformance, User, Word, WordMeaning } from "@prisma/client";
import { updateReviewSession } from "@/lib/actions/review.actions";
import { useCarousel } from "../ui/carousel";

type Hint = Partial<
  Pick<Word, "tags"> & Pick<WordMeaning, "synonyms" | "antonyms" | "examples">
>;
type HintLevel = keyof Hint;
type HintList = {
  field: HintLevel;
  value: Hint[HintLevel];
  label?: string;
}[];

const FieldLabelMap: Record<HintLevel, string> = {
  tags: "Tags/Topics",

  examples: "Example",
  synonyms: "Synonyms",
  antonyms: "Antonyms",
};

const INITIAL_HINT_LIST: HintList = [
  { field: "tags", value: "" },
  { field: "examples", value: "" },
  { field: "synonyms", value: "" },
  { field: "antonyms", value: "" },
];

const FrontFace = ({
  word,
  setIsFlipped,
  onPerformanceUpdate,
  reviewLogId,
}: {
  word: WordWithMeanings;
  setIsFlipped: (value: boolean) => void;
  onPerformanceUpdate: (performance: ReviewPerformance) => void;
  reviewLogId?: string;
}) => {
  const [showHint, setShowHint] = React.useState(false);
  const [hintLevel, setHintLevel] = React.useState<HintLevel | null>(null);
  const [hintList, setHintList] = useState<HintList>(INITIAL_HINT_LIST);
  const { scrollNext } = useCarousel();
  const [isReviewed, setIsReviewed] = useState(false);
  const session = useSession();

  const availableHints = useMemo(() => {
    const availableHints: Hint = {};
    if (word.tags) availableHints.tags = word.tags;
    if (word.meanings[0]?.examples)
      availableHints.examples = word.meanings[0]?.examples;
    if (word.meanings[0]?.synonyms)
      availableHints.synonyms = word.meanings[0]?.synonyms;
    if (word.meanings[0]?.antonyms)
      availableHints.antonyms = word.meanings[0]?.antonyms;
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

  const { isPending: isUpdatingReviewSession, mutate: reviewSessionMutate } =
    useMutation({
      mutationFn: async (performance: ReviewPerformance) => {
        await updateReviewSession(word.id, performance, reviewLogId);
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
    reviewSessionMutate(ReviewPerformance.Forgot);
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
      case "tags":
        reviewSessionMutate(ReviewPerformance.Good);
        onPerformanceUpdate("Good");
        break;
      case "synonyms":
      case "antonyms":
        reviewSessionMutate(ReviewPerformance.Medium);
        onPerformanceUpdate("Medium");
        break;
      case "examples":
        reviewSessionMutate(ReviewPerformance.Hard);
        onPerformanceUpdate("Hard");
        break;
      default:
        reviewSessionMutate(ReviewPerformance.Easy);
        onPerformanceUpdate("Easy");
        break;
    }
    setIsReviewed(true);
    if (hintLevel) setIsFlipped(true);
    else scrollNext();
  };

  const currentHint = useMemo(() => {
    if (!hintLevel) return null;
    return hintList.find((hint) => hint.field === hintLevel);
  }, [hintLevel, hintList]);

  return (
    <div className="flex flex-col px-4 sm:px-8 py-4 bg-primary rounded-2xl h-full">
      <div className="grow flex flex-col justify-center items-center">
        <Badge className="bg-primary-2 text-white">
          {word.meanings[0]?.cefrLevel}
        </Badge>
        <div className="text-[40px] font-bold mt-2 text-white text-center">
          {word.word}
        </div>
      </div>
      {!isReviewed && (
        <>
          <div className="flex justify-between gap-2 ">
            {Object.keys(availableHints).length > 0 && !showHint && (
              <Button
                className="border border-white bg-transparent flex-1"
                onClick={handleClickShowHint}
              >
                <Lightbulb width={14} height={14} className="text-primary-2" />
                Need a hint?
              </Button>
            )}
            <Button
              className="border border-white bg-transparent flex-1"
              onClick={handleClickMarkAsFamiliar}
              disabled={isUpdatingReviewSession}
            >
              <CircleCheckBig
                width={14}
                height={14}
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
                {FieldLabelMap[currentHint.field]}:{" "}
                {currentHint.field === "tags" ||
                  currentHint.field === "synonyms" ||
                  (currentHint.field === "antonyms" && (
                    <span className="text-primary-2 text-sm">
                      {currentHint.value}
                    </span>
                  ))}
                {currentHint.field === "examples" && (
                  <ul className="text-primary-2 text-sm list-disc list-inside">
                    {(currentHint.value as string[]).map((example, index) => (
                      <li key={index}>{example}</li>
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
            disabled={isUpdatingReviewSession}
          >
            I forgot this word.
          </Button>
        </>
      )}
    </div>
  );
};

export default FrontFace;
