"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewIntro from "@/components/review/review-intro";
import ReviewHistory from "@/components/review/review-history";
import ReviewStats from "@/components/review/review-stats";

interface ReviewTabsWrapperProps {
  count: number;
  activeTab: string;
}

const ReviewTabsWrapper = ({ count, activeTab }: ReviewTabsWrapperProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    // Use { scroll: false } to maintain scroll position when switching tabs
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="h-full flex flex-col"
    >
      <TabsList className="mx-auto sticky">
        <TabsTrigger value="start" className="text-sm">
          Start Review
        </TabsTrigger>
        <TabsTrigger value="history" className="text-sm">
          Review history
        </TabsTrigger>
        <TabsTrigger value="statistics" className="text-sm">
          Statictics
        </TabsTrigger>
      </TabsList>
      <TabsContent value="start" className="flex-1">
        <ReviewIntro count={count} />
      </TabsContent>
      <TabsContent value="history" className="flex-1">
        <ReviewHistory />
      </TabsContent>
      <TabsContent value="statistics" className="flex-1">
        <ReviewStats />
      </TabsContent>
    </Tabs>
  );
};

export default ReviewTabsWrapper;
