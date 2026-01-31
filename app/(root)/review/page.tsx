import ReviewCarousel from "@/components/review/review-carousel";
import ReviewIntro from "@/components/review/review-intro";
import { getWordsToReview } from "@/lib/actions/word.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewHistory from "@/components/review/review-history";

const ReviewPage = async () => {
  const wordsToReview = await getWordsToReview();

  if (!wordsToReview) return null;

  return (
    <div className="w-full max-w-[440px] mx-auto h-full py-2 px-4 md:px-0">
      <Tabs defaultValue="start" className="h-full">
        <TabsList className="mx-auto">
          <TabsTrigger value="start" className="text-sm">
            Start Review
          </TabsTrigger>
          <TabsTrigger value="history" className="text-sm">
            Review history
          </TabsTrigger>
        </TabsList>
        <TabsContent value="start">
          <ReviewIntro words={wordsToReview} />
        </TabsContent>
        <TabsContent value="history">
          <ReviewHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewPage;
