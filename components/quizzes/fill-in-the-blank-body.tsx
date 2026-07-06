"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { QuizQuestion } from "@prisma/client";
import { motion } from "framer-motion";

const FillInTheBlankBody = ({
  setSelectedAnswer,
  question,
  correctAnswer,
  isAnswered,
}: {
  question: QuizQuestion;
  setSelectedAnswer: (answer: string) => void;
  correctAnswer: string | null;
  isAnswered: boolean;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const firstGapIndex = useMemo(
    () => question.gapHint?.indexOf("_"),
    [question.gapHint],
  );
  const [currentIndex, setCurrentIndex] = useState<number>(firstGapIndex!);
  const keySoundAudioRef = useRef<HTMLAudioElement | null>(null);

  const [userInput, setUserInput] = useState<string[]>(() =>
    question.gapHint
      ? question.gapHint.split("").map((char) => (char === "_" ? "" : char))
      : [],
  );

  useEffect(() => {
    keySoundAudioRef.current = new Audio("/sounds/key-press.mp3");
    keySoundAudioRef.current.preload = "auto";
  }, []);

  // useEffect(() => {
  //   if (inputRefs.current[firstGapIndex!]) {
  //     inputRefs.current[firstGapIndex!]?.focus();
  //   }
  // }, [firstGapIndex]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (!question.gapHint) return;
    keySoundAudioRef.current!.currentTime = 0;
    keySoundAudioRef.current!.play();

    const value = e.target.value.slice(-1); // Only take the last character
    const newUserInput = [...userInput];
    newUserInput[index] = value;
    setUserInput(newUserInput);

    const finalAnswer = newUserInput
      .map((char, i) =>
        question.gapHint![i] !== "_" ? question.gapHint![i] : char,
      )
      .join("");

    setSelectedAnswer(finalAnswer);

    // Move focus to the next empty input
    if (value && index < question.gapHint.length - 1) {
      const nextGapIndex = question.gapHint.indexOf("_", index + 1);
      if (nextGapIndex !== -1) {
        inputRefs.current[nextGapIndex]?.focus();
        setCurrentIndex(nextGapIndex);
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (!question.gapHint) return;

    // Support backspace navigation for desktop and devices that fire standard key events.
    // e.keyCode 8 is a fallback for legacy mobile support.
    const isBackspace = e.key === "Backspace" || e.keyCode === 8;

    if (isBackspace && !userInput[index] && index > 0) {
      const prevGapIndex = question.gapHint.lastIndexOf("_", index - 1);
      if (prevGapIndex !== -1) {
        inputRefs.current[prevGapIndex]?.focus();
        setCurrentIndex(prevGapIndex);
      }
    }
  };

  /**
   * Backspace on mobile devices often doesn't trigger KeyDown events when the input is empty.
   * 'beforeinput' with inputType 'deleteContentBackward' is a reliable way to detect
   * deletion intent and move focus back on modern mobile browsers.
   */
  const handleBeforeInput = (
    e: React.SyntheticEvent<HTMLInputElement>,
    index: number,
  ) => {
    const nativeEvent = e.nativeEvent as InputEvent;
    if (
      nativeEvent?.inputType === "deleteContentBackward" &&
      !userInput[index] &&
      index > 0
    ) {
      const prevGapIndex = question.gapHint!.lastIndexOf("_", index - 1);
      if (prevGapIndex !== -1) {
        inputRefs.current[prevGapIndex]?.focus();
        setCurrentIndex(prevGapIndex);
      }
    }
  };

  const isCorrect = useMemo(() => {
    if (!isAnswered || !correctAnswer) return false;
    return correctAnswer.toLowerCase() === userInput.join("").toLowerCase();
  }, [isAnswered, correctAnswer, userInput]);

  if (!question.gapHint) return null;

  return (
    <div className="flex justify-center gap-x-1 gap-y-2 flex-wrap">
      {question.gapHint.split("").map((char, index) => {
        const isHint = char !== "_";
        return (
          <motion.input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            maxLength={1}
            value={isHint ? char : userInput[index]}
            onChange={(e) => handleInputChange(e, index)}
            onBeforeInput={(e) => handleBeforeInput(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onClick={() => setCurrentIndex(index)}
            disabled={isHint || isAnswered}
            animate={
              isAnswered
                ? isCorrect
                  ? { y: [0, -15, 0] }
                  : { x: [0, -5, 5, -5, 5, 0] }
                : index === currentIndex
                  ? { scale: [1, 1.15, 1] }
                  : { scale: 1 }
            }
            transition={
              isAnswered
                ? isCorrect
                  ? { duration: 0.4, delay: index * 0.05, ease: "easeInOut" }
                  : { duration: 0.4, ease: "easeInOut" }
                : index === currentIndex
                  ? { duration: 0.3, ease: "easeInOut" }
                  : { duration: 0.15, ease: "easeOut" }
            }
            className={cn(
              "w-12 h-14 text-base md:text-2xl text-center font-bold px-1 outline-none rounded-md border border-b-3 border-r-2 transition-colors duration-300",
              {
                "bg-muted border-dashed text-muted-foreground":
                  isHint && !isAnswered,
                "bg-green-100 border-green-500": isAnswered && isCorrect,
                "bg-red-100 border-red-500": isAnswered && !isCorrect,
                "border-primary-2/50 bg-primary-2/5":
                  index === currentIndex && !isAnswered,
              },
            )}
            aria-label={`Letter ${index + 1} of the word`}
          />
        );
      })}
    </div>
  );
};

export default FillInTheBlankBody;
