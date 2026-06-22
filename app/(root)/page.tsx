import Welcome from "@/components/home/welcome";
import WordCountByPeriodChart from "@/components/home/word-count-by-period-chart";
import WordCountByMasteryLevelChart from "@/components/home/word-count-by-mastery-level-chart";
import RecentWords from "@/components/home/recent-words";
import { Suspense } from "react";
import { OnboardingDialog } from "@/components/home/onboarding-dialog";
import WordOfTheDay from "@/components/home/word-of-the-day";
import DailyHeatMap from "@/components/home/daily-heat-map";

export default async function Home() {
  return (
    <div className="mx-auto p-2 sm:p-4 bg-gray-100">
      <Suspense>
        <OnboardingDialog />
      </Suspense>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4">
        <div className="col-span-1 lg:col-span-6 2xl:col-span-4">
          <Welcome />
        </div>
        <div className="col-span-1 lg:col-span-6 2xl:col-span-4">
          <WordCountByMasteryLevelChart />
        </div>
        <div className="col-span-1 lg:col-span-6 2xl:col-span-4 lg:row-span-2">
          <RecentWords />
        </div>
        <div className="col-span-1 lg:col-span-6 2xl:col-span-5 ">
          <WordCountByPeriodChart />
        </div>
        <div className="col-span-1 lg:col-span-6 2xl:col-span-3 ">
          {/* <WordOfTheDay /> */}
          <DailyHeatMap />
        </div>
      </div>
    </div>
  );
}
