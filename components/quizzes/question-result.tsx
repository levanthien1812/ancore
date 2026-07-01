"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuizQuestionType } from "@/lib/constants/enums";
import { Separator } from "../ui/separator";
import { QuizQuestionWithWords } from "@/lib/type";
import { CheckCircle, CircleX, Info } from "lucide-react";
import {
  CORRECT_ENCOURAGEMENTS,
  INCORRECT_ENCOURAGEMENTS,
} from "@/lib/constants/constant";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import WordDetail from "../word-card/word-detail";

const AnswerWrapper = ({
  isCorrect,
  description,
  correctAnswer,
  words,
}: {
  isCorrect: boolean;
  description?: string;
  correctAnswer?: React.ReactNode;
  words: QuizQuestionWithWords["words"];
}) => {
  const randomIndex = useMemo(() => {
    return Math.floor(Math.random() * CORRECT_ENCOURAGEMENTS.length);
  }, []);

  const randomEncouragement = isCorrect
    ? CORRECT_ENCOURAGEMENTS[randomIndex]
    : INCORRECT_ENCOURAGEMENTS[randomIndex];

  const [selectedWordId, setSelectedWordId] = useState<string | null>(
    words[0].id,
  );

  const selectedWord = words.find((w) => w.id === selectedWordId);

  return (
    <div
      className={cn(
        "p-3 sm:p-4 rounded-md",
        isCorrect && "border-green-300 bg-green-100",
        !isCorrect && "border-red-300 bg-red-100",
      )}
    >
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle className="text-green-600" width={32} height={32} />
          ) : (
            <CircleX className="text-red-600" width={32} height={32} />
          )}
          <div>
            <p className={isCorrect ? "text-green-600" : "text-red-600"}>
              {isCorrect ? "Correct" : "Incorrect"}
            </p>
            <p className="text-sm text-muted-foreground">
              {description || randomEncouragement}
            </p>
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant={"ghost"} size={"sm"} type="button">
              <Info className="text-muted-foreground" width={20} height={20} />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] flex flex-col p-0 bg-primary">
            <DialogHeader className="text-white">
              <DialogTitle>Word Details</DialogTitle>
            </DialogHeader>

            {words.length > 1 && (
              <div className="flex gap-1">
                {words.map((word) => (
                  <Badge
                    key={word.id}
                    variant={
                      selectedWordId === word.id ? "secondary" : "default"
                    }
                    className="cursor-pointer hover:underline"
                    onClick={() => setSelectedWordId(word.id)}
                  >
                    {word.word}
                  </Badge>
                ))}
              </div>
            )}

            {selectedWord ? (
              <WordDetail word={selectedWord} showReviewStats={false} />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Select a word to view details.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
      {correctAnswer && (
        <div className="bg-white/50 p-3 sm:p-4 rounded-md mt-2">
          <p className="mb-1 text-green-600">Correct answer:</p>
          {correctAnswer}
        </div>
      )}
    </div>
  );
};

const QuestionResult = ({
  question,
  localIsCorrect,
  correctAnswer,
}: {
  question: QuizQuestionWithWords;
  localIsCorrect: boolean | null;
  correctAnswer: typeof question.answer;
}) => {
  if (localIsCorrect) {
    return <AnswerWrapper isCorrect={true} words={question.words} />;
  }

  switch (question.type) {
    case QuizQuestionType.DefinitionToWord_Typing:
    case QuizQuestionType.WordToSynonym:
    case QuizQuestionType.FillInTheBlank:
      return (
        <AnswerWrapper
          isCorrect={false}
          words={question.words}
          correctAnswer={<div>{correctAnswer}</div>}
        />
      );
    case QuizQuestionType.Matching:
      if (!question.answer) return null;
      const correctAnswerMap = JSON.parse(question.answer) as Record<
        string,
        string
      >;
      const correctMatches = Object.entries(correctAnswerMap).map(
        ([leftId, rightId], index) => {
          return (
            <div key={leftId} className="grid grid-cols-3 gap-x-4">
              <div className="space-y-3 col-span-1 text-green-600">
                {leftId}
              </div>
              <div className="space-y-3 col-span-2">{rightId}</div>
              {index !== Object.entries(correctAnswerMap).length - 1 && (
                <Separator decorative className="col-span-3 my-2" />
              )}
            </div>
          );
        },
      );

      return (
        <AnswerWrapper
          isCorrect={false}
          description={"Some matches are not correct."}
          words={question.words}
          correctAnswer={
            <div className="border border-green-600 rounded-md p-3 sm:p-4">
              {correctMatches}
            </div>
          }
        />
      );
    default:
      return null;
  }
};

export default QuestionResult;
