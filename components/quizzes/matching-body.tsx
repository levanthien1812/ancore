"use client";

import { QuizQuestion } from "@/lib/type";
import { cn } from "@/lib/utils";
import { shuffleArray } from "@/lib/utils/shuffle-array";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

type MatchItem = {
  id: string;
  text: string;
};

const MatchingBody = ({
  question,
  setSelectedAnswer,
}: {
  question: QuizQuestion;
  setSelectedAnswer: (answer: string) => void;
}) => {
  const [selectedMatchs, setSelectedMatchs] = useState<Record<string, string>>(
    {}
  );

  // Initialize state from props using useMemo to avoid re-shuffling on every render
  const initialLeftItems = useMemo(
    () =>
      question.leftItems.map((item) => ({
        id: item,
        text: item,
      })),
    [question.leftItems]
  );
  const initialRightItems = useMemo(
    () =>
      shuffleArray(question.rightItems).map((item) => ({
        id: item,
        text: item,
      })),
    [question.rightItems]
  );

  const [leftItems, setLeftItems] = useState<MatchItem[]>(initialLeftItems);
  const [rightItems, setRightItems] = useState<MatchItem[]>(initialRightItems);
  const [selectedLeft, setSelectedLeft] = useState<MatchItem | null>(null);

  useEffect(() => {
    if (Object.keys(selectedMatchs).length === initialLeftItems.length) {
      setSelectedAnswer(JSON.stringify(selectedMatchs));
    }
  }, [selectedMatchs, initialLeftItems, setSelectedAnswer]);

  const handleLeftClick = (item: MatchItem) => {
    setSelectedLeft(item);
  };

  const handleRightClick = (rightItem: MatchItem) => {
    if (!selectedLeft) return toast.warning("Select a word on the left first.");

    setSelectedMatchs((prev) => ({
      ...prev,
      [selectedLeft.id]: rightItem.id,
    }));

    setLeftItems((prev) => prev.filter((li) => li.id !== selectedLeft.id));
    setRightItems((prev) => prev.filter((ri) => ri.id !== rightItem.id));
  };

  const getItemClasses = (item: MatchItem, isLeft: boolean) => {
    const isSelected = isLeft && selectedLeft?.id === item.id;

    return cn("border p-3 rounded-md text-left cursor-pointer transition-all", {
      "ring-2 ring-blue-500": isSelected,
    });
  };

  const handleReset = () => {
    setSelectedMatchs({});
    setLeftItems(initialLeftItems);
    setRightItems(initialRightItems);
    setSelectedLeft(null);
  };

  return (
    <div>
      {Object.keys(selectedMatchs).length > 0 && (
        <>
          <div className="border rounded-md p-4">
            {Object.entries(selectedMatchs).map(([leftId, rightId], index) => (
              <div key={leftId} className="grid grid-cols-3 gap-x-4">
                <div className="space-y-3 col-span-1">{leftId}</div>
                <div className="space-y-3 col-span-2">{rightId}</div>
                {index !== Object.entries(selectedMatchs).length - 1 && (
                  <Separator decorative className="col-span-3 my-2" />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button
              className="text-sm p-0"
              variant={"link"}
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </>
      )}
      <div className="grid grid-cols-3 gap-4 mt-4">
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
    </div>
  );
};

export default MatchingBody;
