"use client";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import Congrats from "@/public/images/congrats.png";
import Image from "next/image";
import ReviewSummaryDetail from "./review-summary-detail";
import { StudySessionWithWordReviews } from "@/lib/type";

const ReviewSummary = ({
  studySession,
  onReviewMore,
}: {
  studySession: StudySessionWithWordReviews;
  onReviewMore: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Card className="w-ful h-full">
        <CardHeader>
          <CardTitle className="text-center">Session Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center items-center">
            <Image src={Congrats} alt="congrats" width={240} />
          </div>
          <ReviewSummaryDetail studySession={studySession} />
          <div className="flex gap-4 justify-center pt-4">
            <Button onClick={onReviewMore}>Review more</Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewSummary;
