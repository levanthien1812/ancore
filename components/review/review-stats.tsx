"use client";
import { getReviewStatistics } from "@/lib/actions/review.actions";
import { ReviewPeriod } from "@/lib/utils/date-helpers";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewStatsContent from "./review-stats-content";

const ReviewStats = () => {
  const [period, setPeriod] = useState<ReviewPeriod>("7_days");

  const { data: reviewStats, isLoading } = useQuery({
    queryKey: ["reviewStats", period],
    queryFn: async () => {
      const responseData = await getReviewStatistics(period);
      return responseData;
    },
  });

  return (
    <div className="p-2 md:p-4 border rounded-md h-full">
      <Tabs
        value={period}
        onValueChange={(v) => setPeriod(v as ReviewPeriod)}
        className="h-full flex flex-col"
      >
        <TabsList className="mx-auto sticky">
          <TabsTrigger value={"7_days"} className="text-sm">
            7 days
          </TabsTrigger>
          <TabsTrigger value={"1_month"} className="text-sm">
            1 month
          </TabsTrigger>
          <TabsTrigger value={"all_time"} className="text-sm">
            All time
          </TabsTrigger>
        </TabsList>
        <TabsContent value={period} className="flex-1">
          {isLoading && <div className="text-center">Loading...</div>}
          {reviewStats && (
            <ReviewStatsContent reviewStats={reviewStats} period={period} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewStats;
