"use client";
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuestionType, QuizResultMode } from "@prisma/client";
import { REQUIRED_QUESTION_TYPES } from "@/lib/constants/constant";

const QuizSettings = () => {
  const { register, control } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Settings</CardTitle>
        <CardDescription>
          Configure your quiz sessions, including question types and display
          options.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Questions Per Quiz */}
        <div className="grid gap-1.5">
          <Label htmlFor="questionsPerQuiz">Questions Per Quiz</Label>
          <Input
            id="questionsPerQuiz"
            type="number"
            {...register("questionsPerQuiz", { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground">
            Number of questions to include in each quiz session.
          </p>
        </div>

        {/* Quiz Types */}
        <div className="grid gap-3">
          <Label>Question Types to Include</Label>
          <div className="flex flex-wrap gap-4 p-4 border rounded-lg">
            {Object.values(QuestionType).map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="quizTypes"
                  render={({ field }) => (
                    <Checkbox
                      id={`quiz-type-${type}`}
                      checked={field.value?.includes(type)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...(field.value || []), type]
                          : field.value?.filter((v: string) => v !== type);
                        field.onChange(newValue);
                      }}
                      disabled={REQUIRED_QUESTION_TYPES.includes(type)}
                    />
                  )}
                />
                <Label
                  htmlFor={`quiz-type-${type}`}
                  className="text-sm font-normal"
                >
                  {type.replace(/([A-Z])/g, " $1").trim()}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Select the types of questions to include in your quizzes.
          </p>
        </div>

        {/* Time Limit Per Question */}
        <div className="grid gap-1.5">
          <Label htmlFor="timeLimitPerQuestion">
            Time Limit Per Question (seconds)
          </Label>
          <Input
            id="timeLimitPerQuestion"
            type="number"
            {...register("timeLimitPerQuestion", { valueAsNumber: true })}
          />
          <p className="text-xs text-muted-foreground">
            Set a time limit (in seconds) for answering each question. 0 means
            no limit.
          </p>
        </div>

        {/* Show Results Mode */}
        <div className="grid gap-1.5">
          <Label htmlFor="showResultsMode">Show Results Mode</Label>
          <Controller
            control={control}
            name="showResultsMode"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="showResultsMode">
                  <SelectValue placeholder="Select result mode" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(QuizResultMode).map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode.replace(/([A-Z])/g, " $1").trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            Choose when to display quiz results.
          </p>
        </div>

        {/* Allow Retry */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base" htmlFor="allowRetry">
              Allow Retry
            </Label>
            <p className="text-xs text-muted-foreground">
              Allow retrying incorrect questions immediately.
            </p>
          </div>
          <Controller
            control={control}
            name="allowRetry"
            render={({ field }) => (
              <Switch
                id="allowRetry"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Include Audio Questions */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base" htmlFor="includeAudioQuestions">
              Include Audio Questions
            </Label>
            <p className="text-xs text-muted-foreground">
              Include questions that require listening to audio.
            </p>
          </div>
          <Controller
            control={control}
            name="includeAudioQuestions"
            render={({ field }) => (
              <Switch
                id="includeAudioQuestions"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Include First Letter in Hint */}
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base" htmlFor="includeFirstLetterInHint">
              Include First Letter in Hint
            </Label>
            <p className="text-xs text-muted-foreground">
              For typing questions, include the first letter of the word as part of the hint.
            </p>
          </div>
          <Controller
            control={control}
            name="includeFirstLetterInHint"
            render={({ field }) => (
              <Switch
                id="includeFirstLetterInHint"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizSettings;
