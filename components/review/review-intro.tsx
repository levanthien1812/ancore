"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ReviewCarousel from "@/components/review/review-carousel";
import Link from "next/link";
import Image from "next/image";
import reviewIllustration from "@/public/images/review-illustration.png";
import { WordWithMeanings } from "../add-word/add-word-form";
import { Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getWordsToReview } from "@/lib/actions/word.actions";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { useLayout } from "../layout/layout-context";
import { INITIAL_USER_SETTINGS } from "@/lib/constants/initial-values";

const ReviewIntro = ({ count }: { count: number }) => {
  const [started, setStarted] = useState(false);
  const { settings } = useLayout();
  const [reviewLimit, setReviewLimit] = useState(
    settings?.wordsPerReview ?? INITIAL_USER_SETTINGS.wordsPerReview,
  );
  const [inputValue, setInputValue] = useState(10);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [forThisTimeOnly, setForThisTimeOnly] = useState(true);

  const {
    data: words,
    isLoading,
    refetch,
  } = useQuery<WordWithMeanings[]>({
    queryKey: ["wordsToReview"],
    queryFn: async () => {
      const responseData = await getWordsToReview(reviewLimit);
      return responseData;
    },
    enabled: true,
  });

  useEffect(() => {
    if (!settings || !settings.wordsPerReview) return;
    setReviewLimit(settings?.wordsPerReview);
  }, [settings]);

  const handleStartReview = () => {
    refetch();
    setStarted(true);
  };

  const handleSaveLimit = () => {
    if (inputValue < 1) return;
    setReviewLimit(inputValue);
    setIsPopoverOpen(false);
  };

  const handleReviewMore = () => {
    setStarted(false);
    refetch();
  };

  if (count === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 border rounded-lg p-4 text-center h-full">
        <p className="text-2xl font-semibold">No words to review!</p>
        <p className="text-muted-foreground">
          Add some new words to start your review session.
        </p>
        <Button asChild>
          <Link href="/words">Go to Word List</Link>
        </Button>
      </div>
    );
  }

  if (started && words && words.length > 0) {
    return (
      <div className="h-full">
        <ReviewCarousel words={words} onReviewMore={handleReviewMore} />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4 h-full border rounded-lg p-4 text-center">
      <h1 className="text-2xl font-bold">Ready to Review?</h1>
      <p className="text-base text-muted-foreground text-center">
        Keep your streak alive and strengthen your memory.
      </p>
      <Image src={reviewIllustration} alt="review illustration" height={240} />
      <div>
        <div className="text-muted-foreground text-center">
          {count > reviewLimit ? (
            <p>
              You have{" "}
              <span className="font-bold text-foreground">{count} words</span>{" "}
              due. This session will cover{" "}
              <span className="font-bold text-primary text-lg">
                {reviewLimit}
              </span>{" "}
              of them.
            </p>
          ) : (
            <p>
              You are about to review all{" "}
              <span className="font-bold text-primary text-lg">
                {count} words
              </span>{" "}
              ready for review.
            </p>
          )}
        </div>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant={"link"} size={"sm"}>
              Change session size
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Label htmlFor="count" className="text-right">
              Number of words to review
            </Label>
            <Input
              id="count"
              type="number"
              placeholder="Enter the number of words"
              className="w-full mt-1"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
            />
            <div className="flex gap-2 mt-4">
              <Checkbox
                id="forThisTimeOnly"
                checked={forThisTimeOnly}
                onCheckedChange={(value) => setForThisTimeOnly(!!value)}
              />
              <Label htmlFor="forThisTimeOnly" className="text-right">
                For this session only
              </Label>
            </div>
            <div className="mt-2 flex justify-end gap-1">
              <Button
                variant={"ghost"}
                size={"sm"}
                onClick={() => setIsPopoverOpen(false)}
              >
                Cancel
              </Button>
              <Button size={"sm"} onClick={handleSaveLimit}>
                Save
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Button onClick={handleStartReview} size="lg" isLoading={isLoading}>
        <Play width={16} />
        {isLoading ? "Loading..." : "Start Review"}
      </Button>
    </div>
  );
};

export default ReviewIntro;
