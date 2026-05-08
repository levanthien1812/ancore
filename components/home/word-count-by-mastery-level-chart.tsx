"use client";
import { MasteryLevel } from "@prisma/client";
import { BarChart, Bar, XAxis, LabelList, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { getWordsCountPerMasteryLevel } from "@/lib/actions/word.actions";
import { WordsCountByMasteryLevel } from "@/lib/type";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import { Info } from "lucide-react";
import { MasteryLevelColorCode } from "@/lib/constants/enums";
import { Skeleton } from "../ui/skeleton";

const WordCountByMasteryLevelChart = () => {
  const { data: wordCounts, isLoading } =
    useQuery<WordsCountByMasteryLevel | null>({
      queryKey: [QUERY_KEY.GET_WORDS_COUNT_BY_MASTERY_LEVEL],
      queryFn: async () => {
        const fetchedWordCounts = await getWordsCountPerMasteryLevel();
        return fetchedWordCounts;
      },
    });

  const chartData = wordCounts
    ? Object.keys(wordCounts).map((level) => ({
        level: level,
        count: wordCounts[level as MasteryLevel],
      }))
    : [];

  const chartConfig = {
    New: {
      label: "New",
      color: MasteryLevelColorCode.New.primary,
    },
    Learning: {
      label: "Learning",
      color: MasteryLevelColorCode.Learning.primary,
    },
    Familiar: {
      label: "Familiar",
      color: MasteryLevelColorCode.Familiar.primary,
    },
    Mastered: {
      label: "Mastered",
      color: MasteryLevelColorCode.Mastered.primary,
    },
  } satisfies ChartConfig;

  const total = chartData.reduce((acc, { count }) => acc + count, 0);

  const percentages = chartData.reduce(
    (acc, { level, count }) => ({
      ...acc,
      [level]: total > 0 ? Math.round((count / total) * 100) : 0,
    }),
    {} as Record<string, number>,
  );

  const chart = (
    <ChartContainer config={chartConfig} className="min-h-40 max-h-64 w-full">
      <BarChart accessibilityLayer data={chartData}>
        <defs>
          {Object.entries(MasteryLevelColorCode).map(([level, color]) => (
            <linearGradient
              key={level}
              id={`grad-${level}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor={color.light} stopOpacity={1} />
              <stop offset="30%" stopColor={color.primary} stopOpacity={1} />
            </linearGradient>
          ))}
        </defs>
        <ChartTooltip content={<ChartTooltipContent nameKey="level" />} />
        <XAxis
          dataKey="level"
          tickLine={false}
          tickMargin={10}
          axisLine={true}
          fontSize={14}
        />
        <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={60}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`url(#grad-${entry.level})`} />
          ))}
          <LabelList
            dataKey="count"
            position="top"
            offset={4}
            fontSize={14}
            fontWeight={"bold"}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );

  const statistics = (
    <div className="bg-gray-50 p-2 sm:p-3 rounded-md flex border">
      <div className="border-r px-2 md:px-4">
        <p className="text-sm">Total words</p>
        <p className="text-xl font-bold">{total}</p>
      </div>
      <div className="flex-1 flex justify-around">
        {Object.entries(percentages).map(([level, percentage]) => (
          <div key={level} className="flex items-center gap-1 px-2">
            <div>
              <div className="texl-lg sm:text-xl font-bold flex gap-1 items-center">
                <div
                  className="w-2 h-2 rounded-[2px]"
                  style={{
                    backgroundColor:
                      MasteryLevelColorCode[level as MasteryLevel].primary,
                  }}
                ></div>
                <span>{percentage as number}%</span>
              </div>
              <p className="text-xs text-gray-500">{level}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-4 rounded-2xl space-y-2 h-full">
      <p className="text-xl sm:text-2xl font-bold text-primary">
        Word counts by mastery level{" "}
        <Info width={16} height={16} className="inline text-muted-foreground" />
      </p>

      {isLoading || !wordCounts ? (
        <LoadingSkeleton />
      ) : (
        <>
          {chart}
          {statistics}
        </>
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="h-[200px] w-full rounded-xl" />
    <div className="bg-gray-50 p-3 rounded-md flex border gap-4">
      <div className="border-r pr-4">
        <p className="text-sm mb-1">Total words</p>
        <Skeleton className="h-8 w-12" />
      </div>
      <div className="flex-1 flex gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <Skeleton className="w-2 h-2 rounded-[2px]" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default WordCountByMasteryLevelChart;
