import Welcome from "@/components/home/welcome";
import WordCountByPeriodChart from "@/components/home/word-count-by-period-chart";
import WordCountByMasteryLevelChart from "@/components/home/word-count-by-mastery-level-chart";
import RecentWords from "@/components/home/recent-words";
import { Suspense } from "react";
import { OnboardingDialog } from "@/components/home/onboarding-dialog";
import WordOfTheDay from "@/components/home/word-of-the-day";

export default async function Home() {
  return (
    <div className="mx-auto p-2 sm:p-4 bg-gray-100">
      <Suspense>
        <OnboardingDialog />
      </Suspense>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4">
        <div className="col-span-1 md:col-span-6 2xl:col-span-4">
          <Welcome />
        </div>
        <div className="col-span-1 md:col-span-6 2xl:col-span-4">
          <WordCountByMasteryLevelChart />
        </div>
        <div className="col-span-1 md:col-span-6 2xl:col-span-4 md:row-span-2">
          <RecentWords />
        </div>
        <div className="col-span-1 md:col-span-6 2xl:col-span-5 ">
          <WordCountByPeriodChart />
        </div>
        <div className="col-span-1 md:col-span-6 2xl:col-span-3 ">
          <WordOfTheDay />
        </div>
      </div>
    </div>
  );
}
