import Welcome from "@/components/home/welcome";
import WordCountByPeriodChart from "@/components/home/word-count-by-period-chart";
import WordCountByMasteryLevelChart from "@/components/home/word-count-by-mastery-level-chart";
import { Button } from "@/components/ui/button";
import RecentWords from "@/components/home/recent-words";
import WordOfTheDay from "@/components/home/word-of-the-day";

export default async function Home() {
  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-2 gap-8">
        <div className="">
          <Welcome />
        </div>
        <div className="row-span-3">
          <RecentWords />
        </div>
        <div className="">
          <WordCountByMasteryLevelChart />
        </div>
        <div className="">
          <WordCountByPeriodChart />
        </div>
      </div>
    </div>
  );
}
