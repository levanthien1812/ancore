import Welcome from "@/components/home/welcome";
import WordCountByPeriodChart from "@/components/home/word-count-by-period-chart";
import WordCountByMasteryLevelChart from "@/components/home/word-count-by-mastery-level-chart";
import RecentWords from "@/components/home/recent-words";
import { Suspense } from "react";
import { OnboardingDialog } from "@/components/home/onboarding-dialog";

export default async function Home() {
  return (
    <div className="container mx-auto">
      <Suspense>
        <OnboardingDialog />
      </Suspense>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <Welcome />
        </div>
        <div className="col-span-4">
          <WordCountByMasteryLevelChart />
        </div>
        <div className="col-span-5 row-span-3">
          <RecentWords />
        </div>
        <div className="col-span-7">
          <WordCountByPeriodChart />
        </div>
      </div>
    </div>
  );
}
