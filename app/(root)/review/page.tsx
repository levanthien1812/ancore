import ReviewIntro from "@/components/review/review-intro";
import { getWordsToReviewCount } from "@/lib/actions/word.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewHistory from "@/components/review/review-history";
import ReviewStats from "@/components/review/review-stats";

const ReviewPage = async () => {
  const wordsToReviewCount = await getWordsToReviewCount();

  return (
    <div className="sm:min-w-[520px] sm:max-w-[25%] mx-auto py-2 px-2 sm:px-4 flex flex-col h-full">
      <Tabs defaultValue="start" className="h-full flex flex-col">
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
          <ReviewIntro count={wordsToReviewCount} />
        </TabsContent>
        <TabsContent value="history" className="flex-1">
          <ReviewHistory />
        </TabsContent>
        <TabsContent value="statistics" className="flex-1">
          <ReviewStats />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewPage;
