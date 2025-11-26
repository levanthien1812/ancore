"use client";

import { QuizQuestion } from "@/lib/type";
import { cn } from "@/lib/utils";
import { shuffleArray } from "@/lib/utils/shuffle-array";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

type MatchItem = {
  id: string;
  text: string;
  isMatched: boolean;
};

const MatchingBody = ({
  question,
  setSelectedAnswer,
}: {
  question: QuizQuestion;
  setSelectedAnswer: (answer: string) => void;
}) => {
  // Initialize state from props using useMemo to avoid re-shuffling on every render
  const initialLeftItems = useMemo(
    () =>
      question.leftItems.map((item) => ({
        id: item,
        text: item,
        isMatched: false,
      })),
    [question.leftItems]
  );
  const initialRightItems = useMemo(
    () =>
      shuffleArray(question.rightItems).map((item) => ({
        id: item,
        text: item,
        isMatched: false,
      })),
    [question.rightItems]
  );

  const [leftItems, setLeftItems] = useState<MatchItem[]>(initialLeftItems);
  const [rightItems, setRightItems] = useState<MatchItem[]>(initialRightItems);
  const [selectedLeft, setSelectedLeft] = useState<MatchItem | null>(null);
  const [incorrectMatch, setIncorrectMatch] = useState<[string, string] | null>(
    null
  );

  const handleLeftClick = (item: MatchItem) => {
    if (item.isMatched) return;
    setSelectedLeft(item);
    setIncorrectMatch(null);
  };

  const handleRightClick = (rightItem: MatchItem) => {
    if (rightItem.isMatched) return toast.warning("Item already matched.");
    if (!selectedLeft) return toast.warning("Select a word on the left first.");

    const correctAnswerMap = JSON.parse(question.answer);
    const isCorrect = correctAnswerMap[selectedLeft.text] === rightItem.text;

    if (isCorrect) {
      const newLeftItems = leftItems.map((li) =>
        li.id === selectedLeft.id ? { ...li, isMatched: true } : li
      );
      const newRightItems = rightItems.map((ri) =>
        ri.id === rightItem.id ? { ...ri, isMatched: true } : ri
      );
      setLeftItems(newLeftItems);
      setRightItems(newRightItems);
      setSelectedLeft(null);

      // Check if all are matched
      if (newLeftItems.every((item) => item.isMatched)) {
        setSelectedAnswer(question.answer); // Mark as complete
      }
    } else {
      setIncorrectMatch([selectedLeft.id, rightItem.id]);
      setTimeout(() => {
        setIncorrectMatch(null);
        setSelectedLeft(null);
      }, 500);
    }
  };

  const getItemClasses = (item: MatchItem, isLeft: boolean) => {
    const isSelected = isLeft && selectedLeft?.id === item.id;
    const isIncorrect =
      incorrectMatch &&
      (incorrectMatch[0] === item.id || incorrectMatch[1] === item.id);

    return cn(
      "border p-3 rounded-md text-left cursor-pointer transition-all",
      {
        "bg-green-100 border-green-400 cursor-not-allowed text-muted-foreground":
          item.isMatched,
      },
      { "ring-2 ring-blue-500": isSelected },
      { "bg-red-100 border-red-400 animate-shake": isIncorrect }
    );
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-3 col-span-1">
        {leftItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleLeftClick(item)}
            className={getItemClasses(item, true)}
          >
            {item.text}
          </div>
        ))}
      </div>
      <div className="space-y-3 col-span-2">
        {rightItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleRightClick(item)}
            className={getItemClasses(item, false)}
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchingBody;
