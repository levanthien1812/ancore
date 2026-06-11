import { shuffleArray } from "@/lib/utils/shuffle-array";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { QuizQuestion } from "@prisma/client";

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
      {shuffledOptions.map((option) => (
        <Button
          key={option}
          type="button"
          variant={isSelected(option) ? "default" : "outline"}
          onClick={() => setSelectedAnswer(option)}
          className={cn("h-auto py-3 whitespace-normal justify-start", {
            "bg-green-500 hover:bg-green-600 text-white":
              correctAnswer && isCorrectOption(option),
            "bg-red-500 hover:bg-red-600 text-white":
              correctAnswer &&
              option === selectedAnswer &&
              !isCorrectOption(option),
          })}
          disabled={!!correctAnswer}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};

export default MultipleChoiceBody;
