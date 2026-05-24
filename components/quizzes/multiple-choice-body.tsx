import { shuffleArray } from "@/lib/utils/shuffle-array";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { QuizQuestion } from "@prisma/client";

const MultipleChoiceBody = ({
  question,
  selectedAnswer,
  setSelectedAnswer,
}: {
  question: QuizQuestion;
  selectedAnswer: string | null;
  setSelectedAnswer: (answer: string) => void;
}) => {
  const [shuffledOptions] = useState(() => shuffleArray(question.options));

  const isCorrectOption = useCallback(
    (option: string) => {
      if (!question.answer) return false;
      return option === question.answer;
    },
    [question.answer],
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
              question.answer && isCorrectOption(option),
            "bg-red-500 hover:bg-red-600 text-white":
              question.answer &&
              option === selectedAnswer &&
              !isCorrectOption(option),
          })}
          disabled={!!question.answer}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};

export default MultipleChoiceBody;
