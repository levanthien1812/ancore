import React from "react";
import { PerformanceSummary } from "./review-carousel";
import { Badge } from "../ui/badge";

const WordList = ({ title, words }: { title: string; words: string[] }) => {
  if (words.length === 0) return null;

  const colorMap: Record<string, string> = {
    Forgot: "border-level-forgot bg-level-forgot/10",
    Hard: "border-level-hard bg-level-hard/10",
    Medium: "border-level-medium bg-level-medium/10",
    Good: "border-level-good bg-level-good/10",
    Easy: "border-level-easy bg-level-easy/10",
  };

  return (
    <div>
      <h3 className="font-semibold">
        {title} ({words.length})
      </h3>
      <div className="flex flex-wrap gap-2 mt-1">
        {words.map((word, index) => (
          <Badge
            key={`${word}-${index}`}
            className={`text-md ${colorMap[title]}`}
            variant={"outline"}
          >
            {word}
          </Badge>
        ))}
      </div>
    </div>
  );
};

const ReviewSummaryDetail = ({ summary }: { summary: PerformanceSummary }) => {
  const total = Object.values(summary).reduce(
    (acc, words) => acc + words.length,
    0
  );

  return (
    <div className="border border-dashed rounded-lg border-primary p-4">
      <p className="text-center text-xl font-bold text-primary-2">
        You reviewed {total} words.
      </p>
      <div className="space-y-3">
        <WordList title="Forgot" words={summary.Forgot} />
        <WordList title="Hard" words={summary.Hard} />
        <WordList title="Medium" words={summary.Medium} />
        <WordList title="Good" words={summary.Good} />
        <WordList title="Easy" words={summary.Easy} />
      </div>
    </div>
  );
};

export default ReviewSummaryDetail;
