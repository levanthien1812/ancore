"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import ReviewCarousel from "@/components/review/review-carousel";
import Link from "next/link";
import Image from "next/image";
import reviewIllustration from "@/public/images/review-illustration.png";
import { WordWithMeanings } from "../add-word/add-word-form";

const ReviewIntro = ({ words }: { words: WordWithMeanings[] }) => {
  const [started, setStarted] = useState(false);

  if (words.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 h-full border rounded-lg p-4 text-center">
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

  if (started) {
    return <ReviewCarousel words={words} />;
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4 h-full border rounded-lg p-4 text-center">
      <h1 className="text-2xl font-bold">Ready to Review?</h1>
      <Image
        src={reviewIllustration}
        alt="review illustration"
        className="w-full rounded-2xl"
      />
      <div className="text-muted-foreground text-center">
        <p>You have {words.length} words ready to review.</p>
      </div>
      <Button onClick={() => setStarted(true)} size="lg">
        Start Review
      </Button>
    </div>
  );
};

export default ReviewIntro;
