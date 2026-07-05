import { shuffleArray } from "@/lib/utils/shuffle-array";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { QuizQuestion } from "@prisma/client";
import { MotionButton } from "../shared/motion-button";

const MultipleChoiceBody = ({
  question,
  selectedAnswer,
  setSelectedAnswer,
  correctAnswer,
}: {
  question: QuizQuestion;
  selectedAnswer: string | null;
  correctAnswer: string | null;
  setSelectedAnswer: (answer: string) => void;
}) => {
  const [shuffledOptions] = useState<string[]>(() => {
    return shuffleArray([...question.options]);
  });

  const isCorrectOption = useCallback(
    (option: string) => {
      if (!correctAnswer) return false;
      return option === correctAnswer;
    },
    [correctAnswer],
  );
  const isSelected = useCallback(
    (option: string) => {
      return option === selectedAnswer;
    },
    [selectedAnswer],
  );

  return (
    <div className="grid grid-cols-1 gap-3">
      {shuffledOptions.map((option) => {
        const isCorrect = correctAnswer && isCorrectOption(option);
        const isWrongSelected =
          correctAnswer &&
          option === selectedAnswer &&
          !isCorrectOption(option);

        return (
          <MotionButton
            key={option}
            type="button"
            variant={isSelected(option) ? "default2" : "outline"}
            onClick={() => setSelectedAnswer(option)}
            animate={
              isCorrect
                ? { y: [0, -10, 0] }
                : isWrongSelected
                  ? { x: [0, -5, 5, -5, 5, 0] }
                  : {}
            }
            transition={{ duration: 0.3 }}
            className={cn(
              "h-auto py-3 whitespace-normal justify-start transition-colors duration-300",
              {
                "pointer-events-none cursor-not-allowed": !!correctAnswer,
                "bg-green-500 border border-green-700 border-b-3 border-r-2 text-white":
                  isCorrect,
                "bg-red-500 border border-red-700 border-b-4 border-r-2 text-white":
                  isWrongSelected,
                "border border-b-3 border-r-2":
                  !correctAnswer && isSelected(option),
              },
            )}
          >
            {option}
          </MotionButton>
        );
      })}
    </div>
  );
};

export default MultipleChoiceBody;
