import {
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";

export type ReviewPeriod = "7_days" | "1_month" | "all_time";

export function getPeriodDateRange(period: ReviewPeriod): {
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  previousPeriodStart: Date | null;
  previousPeriodEnd: Date | null;
} {
  const now = new Date();
  const currentPeriodEnd = endOfDay(now);

  let currentPeriodStart: Date;
  let previousPeriodStart: Date | null = null;
  let previousPeriodEnd: Date | null = null;

  switch (period) {
    case "7_days":
      currentPeriodStart = startOfDay(subDays(now, 6)); // Last 7 days including today
      previousPeriodEnd = endOfDay(subDays(now, 7)); // Day before current period starts
      previousPeriodStart = startOfDay(subDays(previousPeriodEnd, 6)); // 7 days before that
      break;
    case "1_month":
      currentPeriodStart = startOfMonth(now);
      previousPeriodEnd = endOfMonth(subMonths(now, 1));
      previousPeriodStart = startOfMonth(subMonths(now, 1));
      break;
    case "all_time":
      currentPeriodStart = new Date(0); // Epoch start
      // No previous period for 'all_time'
      break;
    default:
      throw new Error("Invalid period specified");
  }

  return {
    currentPeriodStart,
    currentPeriodEnd,
    previousPeriodStart,
    previousPeriodEnd,
  };
}
