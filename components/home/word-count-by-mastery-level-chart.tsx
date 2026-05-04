"use client";
import { MasteryLevel } from "@prisma/client";
import { BarChart, Bar, XAxis, LabelList, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getWordsCountPerMasteryLevel } from "@/lib/actions/word.actions";
import { WordsCountByMasteryLevel } from "@/lib/type";
import { defaultWordsCountByMasteryLevel } from "@/lib/constants/initial-values";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import { Info } from "lucide-react";
import { MasteryLevelColorCode } from "@/lib/constants/enums";

const WordCountByMasteryLevelChart = () => {
  const { data: wordCounts } = useQuery<WordsCountByMasteryLevel | null>({
    queryKey: [QUERY_KEY.GET_WORDS_COUNT_BY_MASTERY_LEVEL],
    queryFn: async () => {
      const fetchedWordCounts = await getWordsCountPerMasteryLevel();
      return fetchedWordCounts;
    },
    initialData: defaultWordsCountByMasteryLevel,
  });

  if (!wordCounts) {
    return null;
  }

  const chartData = Object.keys(wordCounts).map((level) => ({
    level: level,
    count: wordCounts[level as MasteryLevel],
  }));

  const chartConfig = {
    count: {
      label: "Word Count",
      color: "#2563eb",
    },
  };

  const total = chartData.reduce((acc, { count }) => acc + count, 0);

  const percentages = chartData.reduce(
    (acc, { level, count }) => ({
      ...acc,
      [level]: Math.round((count / total) * 100),
    }),
    {} as Record<string, number>,
  );

  return (
    <div className="bg-white p-4 rounded-2xl gap-2 h-full">
      <p className="text-2xl font-bold text-primary">
        Word counts by mastery level{" "}
        <span>
          <Info
            width={18}
            height={18}
            className="inline text-muted-foreground"
          />
        </span>
      </p>
      <ChartContainer config={chartConfig} className="min-h-40 w-full">
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
                <stop offset="40%" stopColor={color.primary} stopOpacity={1} />
              </linearGradient>
            ))}
          </defs>
          <ChartTooltip content={<ChartTooltipContent />} />
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
      {wordCounts && (
        <div className="mt-2 bg-gray-50 p-3 rounded-md flex border">
          <div className="border-r px-2">
            <p className="text-sm">Total words</p>
            <p className="text-xl font-bold">{total}</p>
          </div>
          <div className="flex-1 flex">
            {Object.entries(percentages).map(([level, percentage]) => (
              <div key={level} className="flex items-center gap-1 flex-1 px-2">
                <div>
                  <div className="texl-lg sm:text-xl font-bold flex gap-1 items-center">
                    <div
                      className="w-2 h-2 rounded-full"
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
      )}
    </div>
  );
};

export default WordCountByMasteryLevelChart;
