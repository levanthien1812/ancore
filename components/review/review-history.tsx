"use client";
import React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { getReviewLogs } from "@/lib/actions/review.actions";
import ReviewSummaryDetail from "./review-summary-detail";
import { PerformanceSummary } from "./review-carousel";
import { format } from "date-fns";
import { Badge } from "../ui/badge";

const ReviewHistory = () => {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  const { data: reviewLogs, isFetching: isFetchingReviewLogs } = useQuery({
    queryFn: async () => {
      if (!date) return;
      const response = await getReviewLogs(date);
      return response;
    },
    queryKey: ["reviewLogs", date],
    enabled: !!date,
  });

  return (
    <div className="flex flex-col gap-3 border rounded-lg p-4 h-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal mx-auto"
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="center">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {isFetchingReviewLogs && <div className="text-center">Loading...</div>}
      {!isFetchingReviewLogs && reviewLogs && reviewLogs.length > 0 && (
        <div className="flex flex-col space-y-1">
          {reviewLogs.map((log) => (
            <div key={log.id}>
              <Badge className="mb-0.5">
                Completed at:{" "}
                <span>{format(log.completedAt, "dd/MM/yyyy hh:mm a")}</span>
              </Badge>
              <ReviewSummaryDetail
                summary={log.performanceSummary as PerformanceSummary}
              />
            </div>
          ))}
        </div>
      )}
      {!isFetchingReviewLogs && (!reviewLogs || reviewLogs.length === 0) && (
        <p className="text-center text-muted-foreground text-xl">
          No review logs found
        </p>
      )}
    </div>
  );
};

export default ReviewHistory;
