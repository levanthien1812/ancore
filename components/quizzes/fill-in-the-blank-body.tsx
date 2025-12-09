"use client";

import { QuizQuestion } from "@/lib/type";
import { Input } from "../ui/input";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const FillInTheBlankBody = ({
  setSelectedAnswer,
  question,
}: {
  question: QuizQuestion;
  setSelectedAnswer: (answer: string) => void;
}) => {
  const answer = question.answer;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Determine which letters to show as hints. Use useState's lazy initializer to run only once.
  const [hintIndices] = useState(() => {
    const indices = new Set<number>();
    const len = answer.length;
    if (len <= 2) return indices; // No hints for very short words

    // Always show the first letter
    indices.add(0);

    // Add a few more random hints (e.g., up to 30% of the word)
    const hintCount = Math.floor(len * 0.3);
    while (indices.size < hintCount + 1 && indices.size < len - 1) {
      const randomIndex = Math.floor(Math.random() * len);
      indices.add(randomIndex);
    }
    return indices;
  });

  const [userInput, setUserInput] = useState<string[]>(() =>
    Array(answer.length).fill("")
  );

  // Update parent component's state when user input changes
  useEffect(() => {
    const finalAnswer = userInput
      .map((char, i) => (hintIndices.has(i) ? answer[i] : char))
      .join("");
    setSelectedAnswer(finalAnswer.length === answer.length ? finalAnswer : "");
  }, [userInput, hintIndices, answer, setSelectedAnswer]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.slice(-1); // Only take the last character
    const newUserInput = [...userInput];
    newUserInput[index] = value;
    setUserInput(newUserInput);

    // Move focus to the next empty input
    if (value && index < answer.length - 1) {
      const nextInput = inputRefs.current
        .slice(index + 1)
        .find((ref) => ref && !ref.disabled);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !userInput[index] && index > 0) {
      // Move focus to the previous input on backspace if current is empty
      const prevInput = [...inputRefs.current].reverse().find((ref, i) => {
        const originalIndex = answer.length - 1 - i;
        return originalIndex < index && ref && !ref.disabled;
      });
      prevInput?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-1">
      {answer.split("").map((char, index) => {
        const isHint = hintIndices.has(index);
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
            disabled={isHint}
            className={cn(
              "w-12 h-14 text-2xl text-center font-bold px-1",
              isHint && "bg-muted border-dashed text-muted-foreground"
            )}
            aria-label={`Letter ${index + 1} of the word`}
          />
        );
      })}
    </div>
  );
};

export default FillInTheBlankBody;
