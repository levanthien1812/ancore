"use client";

import { cn } from "@/lib/utils";
import { shuffleArray } from "@/lib/utils/shuffle-array";
import { useMemo, useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { QuizQuestion } from "@prisma/client";
import { normalizeText } from "@/lib/utils/normalize-text";
import { XArrowStateConnector } from "./x-arrow-list-connector";
import { motion } from "framer-motion";

type MatchItem = {
  id: string;
  text: string;
};

const MatchingBody = ({
  question,
  setSelectedAnswer,
  correctAnswer,
}: {
  question: QuizQuestion;
  setSelectedAnswer: (answer: string) => void;
  correctAnswer: string | null;
}) => {
  const [selectedMatchs, setSelectedMatchs] = useState<Record<string, string>>(
    {},
  );
  const buttonPressAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    buttonPressAudioRef.current = new Audio("/sounds/button-press.mp3");
  }, []);

  // Initialize state from props using useMemo to avoid re-shuffling on every render
  const initialLeftItems = useMemo(
    () =>
      question.leftItems.map((item) => ({
        id: item,
        text: item,
      })),
    [question.leftItems],
  );

  const initialRightItems = useMemo(
    () =>
      shuffleArray([...question.rightItems]).map((item) => ({
        id: item,
        text: item,
      })),
    [question.rightItems],
  );

  const [leftItems, setLeftItems] = useState<MatchItem[]>(initialLeftItems);
  const [rightItems, setRightItems] = useState<MatchItem[]>(initialRightItems);
  const leftRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const rightRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [selectedLeft, setSelectedLeft] = useState<MatchItem | null>(null);

  const handleLeftClick = (item: MatchItem) => {
    buttonPressAudioRef.current!.currentTime = 0;
    buttonPressAudioRef.current!.play();
    setSelectedLeft(item);
  };

  const handleRightClick = (rightItem: MatchItem) => {
    buttonPressAudioRef.current!.currentTime = 0;
    buttonPressAudioRef.current!.play();
    if (!selectedLeft) return toast.warning("Select a word on the left first.");

    const newMatches = {
      ...selectedMatchs,
      [selectedLeft.id]: rightItem.id,
    };
    setSelectedMatchs(newMatches);

    setLeftItems((prev) => prev.filter((li) => li.id !== selectedLeft.id));
    setRightItems((prev) => prev.filter((ri) => ri.id !== rightItem.id));

    if (Object.keys(newMatches).length === initialLeftItems.length) {
      setSelectedAnswer(JSON.stringify(newMatches));
    }
    setSelectedLeft(null);
  };

  const getItemClasses = (item: MatchItem, isLeft: boolean) => {
    const isSelected = isLeft && selectedLeft?.id === item.id;

    return cn(
      "border border-b-3 border-r-2 hover:bg-primary-2/10 p-3 rounded-md text-left cursor-pointer transition-all overflow-hidden",
      {
        "bg-primary-2 border-primary": isSelected,
      },
    );
  };

  const handleReset = () => {
    setSelectedMatchs({});
    setSelectedAnswer("");
    const shuffled = shuffleArray([...question.rightItems]).map((item) => ({
      id: item,
      text: item,
    }));
    setRightItems(shuffled);
    setLeftItems(initialLeftItems);
    setSelectedLeft(null);
  };

  const handleClickSelectedMatch = (leftId: string) => {
    const rightId = selectedMatchs[leftId];
    if (!rightId) return;

    const newMatchs = { ...selectedMatchs };
    delete newMatchs[leftId];
    setSelectedMatchs(newMatchs);
    setSelectedAnswer("");

    setLeftItems((prev) => [...prev, { id: leftId, text: leftId }]);
    setRightItems((prev) => [...prev, { id: rightId, text: rightId }]);
  };

  const isCorrectMatch = (leftId: string, rightId: string) => {
    if (!correctAnswer || !selectedMatchs) return false;
    const correctAnswerMap = JSON.parse(correctAnswer) as Record<
      string,
      string
    >;

    return correctAnswerMap[leftId] === rightId;
  };

  return (
    <div>
      {Object.keys(selectedMatchs).length > 0 && (
        <>
          <div className="space-y-2 relative">
            {Object.entries(selectedMatchs).map(([leftId, rightId]) => (
              <div
                key={leftId}
                className={cn("grid grid-cols-3 gap-x-8 items-start")}
              >
                <motion.div
                  className={cn(
                    "col-span-1 border-primary border border-b-3 border-r-2 p-3 rounded-md transition-colors duration-300",
                    {
                      "bg-primary-2": !correctAnswer,
                      "bg-green-500 border border-green-700 border-b-3 border-r-2 text-white":
                        correctAnswer && isCorrectMatch(leftId, rightId),
                      "bg-red-500 border border-red-700 border-b-3 border-r-2 text-white":
                        correctAnswer && !isCorrectMatch(leftId, rightId),
                    },
                  )}
                  animate={
                    !correctAnswer
                      ? {}
                      : isCorrectMatch(leftId, rightId)
                        ? { y: [0, -10, 0] }
                        : { x: [0, -5, 5, -5, 5, 0] }
                  }
                  transition={{
                    duration: 0.4,
                  }}
                  ref={(el) => {
                    leftRefs.current[leftId] = el;
                  }}
                  onClick={() => handleClickSelectedMatch(leftId)}
                  title="Click to unmatch"
                >
                  {normalizeText(leftId)}
                </motion.div>
                <motion.div
                  className={cn(
                    "col-span-2 border-primary border border-b-3 border-r-2 p-3 rounded-md transition-colors duration-300",
                    {
                      "bg-primary-2": !correctAnswer,
                      "bg-green-500 border border-green-700 border-b-3 border-r-2 text-white":
                        correctAnswer && isCorrectMatch(leftId, rightId),
                      "bg-red-500 border border-red-700 border-b-3 border-r-2 text-white":
                        correctAnswer && !isCorrectMatch(leftId, rightId),
                    },
                  )}
                  animate={
                    !correctAnswer
                      ? {}
                      : isCorrectMatch(leftId, rightId)
                        ? { y: [0, -10, 0] }
                        : { x: [0, -5, 5, -5, 5, 0] }
                  }
                  transition={{
                    duration: 0.4,
                  }}
                  ref={(el) => {
                    rightRefs.current[rightId] = el;
                  }}
                  onClick={() => handleClickSelectedMatch(leftId)}
                  title="Click to match"
                >
                  {normalizeText(rightId)}
                </motion.div>
              </div>
            ))}
            <XArrowStateConnector
              dataList={Object.entries(selectedMatchs).map(
                ([leftId, rightId]) => ({
                  id: leftId,
                  targetId: rightId,
                }),
              )}
              leftRefs={leftRefs}
              rightRefs={rightRefs}
              strokeColor="rgb(19, 70, 134)"
            />
          </div>
          {!correctAnswer && (
            <div className="flex justify-end">
              <Button
                type="button"
                className="text-sm p-0"
                variant={"link"}
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          )}
        </>
      )}
      <div className="grid grid-cols-3 gap-8 mt-4">
        <div className="space-y-3 col-span-1">
          {leftItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleLeftClick(item)}
              className={getItemClasses(item, true)}
            >
              {normalizeText(item.text)}
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
              {normalizeText(item.text)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchingBody;
