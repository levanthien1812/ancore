import { QuizQuestion } from "@/lib/type";
import { shuffleArray } from "@/lib/utils/shuffle-array";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const MultipleChoiceBody = ({
  question,
  selectedAnswer,
  setSelectedAnswer,
  isAnswered,
}: {
  question: QuizQuestion;
  selectedAnswer: string | null;
  setSelectedAnswer: (answer: string) => void;
  isAnswered: boolean;
}) => {
  const [shuffledOptions] = useState(() => shuffleArray(question.options));

  return (
    <div className="grid grid-cols-1 gap-3">
      {shuffledOptions.map((option) => {
        const isSelected = selectedAnswer === option;
        const isCorrectAnswer = option === question.answer;

        return (
          <Button
            key={option}
            variant={isSelected ? "default" : "outline"}
            onClick={() => !isAnswered && setSelectedAnswer(option)}
            className={cn("h-auto py-3 whitespace-normal justify-start", {
              "bg-green-500 hover:bg-green-600 text-white":
                isAnswered && isCorrectAnswer,
              "bg-red-500 hover:bg-red-600 text-white":
                isAnswered && isSelected && !isCorrectAnswer,
            })}
            disabled={isAnswered}
          >
            {option}
          </Button>
        );
      })}
    </div>
  );
};

export default MultipleChoiceBody;
