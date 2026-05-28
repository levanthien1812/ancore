"use client";

import { Input } from "../ui/input";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { QuizQuestion } from "@prisma/client";

const FillInTheBlankBody = ({
  setSelectedAnswer,
  question,
}: {
  question: QuizQuestion;
  setSelectedAnswer: (answer: string) => void;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [userInput, setUserInput] = useState<string[]>(() =>
    question.gapHint
      ? question.gapHint.split("").map((char) => (char === "_" ? "" : char))
      : [],
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (!question.gapHint) return;
    const value = e.target.value.slice(-1); // Only take the last character
    const newUserInput = [...userInput];
    newUserInput[index] = value;
    setUserInput(newUserInput);

    // Update parent
    const isComplete = newUserInput.every(
      (char, i) => question.gapHint![i] !== "_" || char !== "",
    );
    const finalAnswer = newUserInput
      .map((char, i) =>
        question.gapHint![i] !== "_" ? question.gapHint![i] : char,
      )
      .join("");
    setSelectedAnswer(isComplete ? finalAnswer : "");

    // Move focus to the next empty input
    if (value && index < question.gapHint.length - 1) {
      const nextGapIndex = question.gapHint.indexOf("_", index + 1);
      if (nextGapIndex !== -1) {
        inputRefs.current[nextGapIndex]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (!question.gapHint) return;
    if (e.key === "Backspace" && !userInput[index] && index > 0) {
      const prevGapIndex = question.gapHint.lastIndexOf("_", index - 1);
      if (prevGapIndex !== -1) {
        inputRefs.current[prevGapIndex]?.focus();
      }
    }
  };

  if (!question.gapHint) return null;

  return (
    <div className="flex justify-center gap-1">
      {question.gapHint.split("").map((char, index) => {
        const isHint = char !== "_";
        return (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            maxLength={1}
            value={isHint ? char : userInput[index]}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={isHint || !!question.answer}
            className={cn(
              "w-12 h-14 text-base md:text-2xl text-center font-bold px-1",
              {
                "bg-muted border-dashed text-muted-foreground":
                  isHint && !question.answer,
                "bg-green-100 border-green-600":
                  question.answer && question.answer === userInput.join(""),
                "bg-red-100 border-red-600":
                  question.answer && question.answer !== userInput.join(""),
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
