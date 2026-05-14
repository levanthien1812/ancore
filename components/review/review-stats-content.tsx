"use client";
import { ReviewStatistics } from "@/lib/actions/review.actions";
import { ReviewPeriod } from "@/lib/utils/date-helpers";
import { BookOpenText, Clock, Flame, Target } from "lucide-react";
import IconDisplay from "../shared/icon-display";
import { convertSecondsToHHMM } from "@/lib/utils/time-convert";
import {
  REVIEW_PERFORMANCE_COLOR,
  REVIEW_PERIOD_LABEL,
  ReviewPerformance,
} from "@/lib/constants/enums";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  Cell,
  LabelList,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ReviewStatsContent = ({
  reviewStats,
  period,
}: {
  reviewStats: ReviewStatistics;
  period: ReviewPeriod;
}) => {
  const overviewItems = [
    {
      icon: (
        <IconDisplay
          icon={BookOpenText}
          iconColor="text-blue-600"
          bgClass="bg-blue-100"
          size="lg"
        />
      ),
      textColor: "text-blue-600",
      borderColor: "border-blue-300",
      bgColor: "bg-blue-50",
      stat: reviewStats.totalWordsReviewed,
      label: "Words reviewed",
      highlight: () => {
        if (!reviewStats.periodComparison) return null;
        return `${reviewStats.periodComparison?.wordsReviewedChangePercentage}% vs last ${REVIEW_PERIOD_LABEL[period]}`;
      },
    },
    {
      icon: (
        <IconDisplay
          icon={Target}
          iconColor="text-green-600"
          bgClass="bg-green-100"
          size="lg"
        />
      ),
      textColor: "text-green-600",
      borderColor: "border-green-300",
      bgColor: "bg-green-50",
      stat: `${reviewStats.accuracyPercentage}%`,
      label: "Accuracy",
      highlight: () => {
        if (!reviewStats.periodComparison) return null;
        const previousStat = reviewStats.accuracyPercentage;
        const currentStat = reviewStats.accuracyPercentage;
        const increase = currentStat - previousStat;
        return `${increase > 0 ? "+" : ""}${increase}% vs last ${REVIEW_PERIOD_LABEL[period]}`;
      },
    },
    {
      icon: (
        <IconDisplay
          icon={Clock}
          iconColor="text-yellow-600"
          bgClass="bg-yellow-100"
          size="lg"
        />
      ),
      textColor: "text-yellow-600",
      borderColor: "border-yellow-300",
      bgColor: "bg-yellow-50",
      stat: convertSecondsToHHMM(reviewStats.totalStudyTimeSeconds),
      label: "Study time",
      highlight: () => {
        if (!reviewStats.periodComparison) return null;
        const previousStat =
          reviewStats.periodComparison?.previousTotalStudyTimeSeconds || 0;
        const currentStat = reviewStats.totalStudyTimeSeconds;
        const increase = currentStat - previousStat;
        return `${increase > 0 ? "+" : ""}${convertSecondsToHHMM(increase)} vs last ${REVIEW_PERIOD_LABEL[period]}`;
      },
    },
    {
      icon: (
        <IconDisplay
          icon={Flame}
          iconColor="text-orange-600"
          bgClass="bg-orange-100"
          size="lg"
        />
      ),
      textColor: "text-orange-600",
      borderColor: "border-orange-300",
      bgColor: "bg-orange-50",
      stat: reviewStats.currentReviewStreak,
      label: "Day streak",
      highlight: () => {
        return `Best: ${reviewStats.bestReviewStreak} days`;
      },
    },
  ];

  const wordsReviewedChart = () => {
    const wordsReviewedChartData = reviewStats.dailyPerformanceTrend.map(
      (item) => ({
        date: item.date,
        totalWords: item.totalWords,
      }),
    );

    const wordsReviewedChartConfig = {
      date: {
        label: "Total words",
        color: "oklch(62.3% 0.214 259.815)",
      },
    } as ChartConfig;
    return (
      <div className="border rounded-md">
        <div className="px-4 py-2 bg-gray-100">
          <p className="text-sm font-bold">Daily performance trend</p>
        </div>
        <div className="p-4">
          <ChartContainer
            config={wordsReviewedChartConfig}
            className="min-h-36 max-h-64 w-full mt-1"
          >
            <BarChart accessibilityLayer data={wordsReviewedChartData}>
              <CartesianGrid strokeDasharray={"3 3"} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={6}
                axisLine={true}
                fontSize={12}
              />
              <YAxis
                dataKey="totalWords"
                tickLine={false}
                tickMargin={10}
                axisLine={true}
                fontSize={12}
                width={28}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="totalWords"
                fill={`oklch(62.3% 0.214 259.815)`}
                radius={[6, 6, 0, 0]}
                fontSize={14}
                barSize={30}
              >
                {wordsReviewedChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
                <LabelList
                  dataKey="totalWords"
                  position="top"
                  offset={2}
                  fontSize={12}
                  color="oklch(62.3% 0.214 259.815)"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    );
  };

  const reviewOutcomesChart = () => {
    const data = Object.entries(reviewStats.performanceCounts)
      .map(([key, value]) => ({
        name: key,
        value,
      }))
      .filter((item) => item.value > 0);

    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    return (
      <div className="border rounded-md">
        <div className="px-4 py-2 bg-gray-100">
          <p className="text-sm font-bold">Review outcomes</p>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={1}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      REVIEW_PERFORMANCE_COLOR[entry.name as ReviewPerformance]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                formatter={(value, entry: any) => {
                  const { value: count } = entry.payload;
                  const percent = Math.round((count / total) * 100);
                  return (
                    <span className="text-xs font-medium">
                      {value}:{" "}
                      <span className="text-muted-foreground">
                        {count} ({percent}%)
                      </span>
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <>
      <div>
        <p className="text-sm font-bold">Overview</p>
        <div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-2">
          {overviewItems.map((item, index) => (
            <div
              key={index}
              className={`p-2 rounded-md flex-1 border ${item.borderColor} flex flex-col items-center justify-center gap-1 ${item.bgColor}`}
            >
              {item.icon}
              <p className="text-xl font-bold">{item.stat}</p>
              <p className="text-xs">{item.label}</p>
              <p
                className={`text-[10px] font-bold text-center ${item.textColor}`}
              >
                {item.highlight()}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {wordsReviewedChart()}
        {reviewOutcomesChart()}
      </div>
    </>
  );
};

export default ReviewStatsContent;
