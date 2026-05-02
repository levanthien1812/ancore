import ReviewIntro from "@/components/review/review-intro";
import { getWordsToReview } from "@/lib/actions/word.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewHistory from "@/components/review/review-history";

const ReviewPage = async () => {
  const wordsToReview = await getWordsToReview();

  if (!wordsToReview) return null;

  return (
    <div className="w-full max-w-[440px] mx-auto py-2 px-4 md:px-0 flex flex-col h-full">
      <Tabs defaultValue="start" className="h-full flex flex-col">
        <TabsList className="mx-auto">
          <TabsTrigger value="start" className="text-sm">
            Start Review
          </TabsTrigger>
          <TabsTrigger value="history" className="text-sm">
            Review history
          </TabsTrigger>
        </TabsList>
        <TabsContent value="start" className="h-full flex-1">
          <ReviewIntro words={wordsToReview} />
        </TabsContent>
        <TabsContent value="history" className="h-full flex-1">
          <ReviewHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewPage;
