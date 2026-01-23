"use client";
import { MasteryLevel } from "@prisma/client";
import { BarChart, Bar, XAxis, LabelList } from "recharts";
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

  return (
    <div className="bg-background-2 p-4 md:p-8 rounded-2xl">
      <p className="text-2xl md:text-[28px] font-bold text-primary">
        📊 Word counts by mastery level
      </p>
      <ChartContainer config={chartConfig} className="min-h-40 w-full">
        <BarChart accessibilityLayer data={chartData}>
          <ChartTooltip content={<ChartTooltipContent />} />
          <XAxis
            dataKey="level"
            tickLine={false}
            tickMargin={10}
            axisLine={true}
            fontSize={14}
          />
          <Bar
            dataKey="count"
            fill="var(--color-chart-1)"
            radius={12}
            barSize={60}
          >
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
    </div>
  );
};

export default WordCountByMasteryLevelChart;
