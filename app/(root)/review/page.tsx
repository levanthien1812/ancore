import ReviewCarousel from "@/components/review/review-carousel";
import { Button } from "@/components/ui/button";
import { getWordsToReview } from "@/lib/actions/word.actions";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewHistory from "@/components/review/review-history";

const ReviewPage = async () => {
  const wordsToReview = await getWordsToReview();

  return (
    <div className="w-[440px] mx-auto h-full py-2">
      <Tabs defaultValue="review" className="h-full">
        <TabsList className="mx-auto">
          <TabsTrigger value="review" className="text-sm">
            Review words
          </TabsTrigger>
          <TabsTrigger value="history" className="text-sm">
            Review history
          </TabsTrigger>
        </TabsList>
        <TabsContent value="review">
          <div className="h-full">
            {wordsToReview.length === 0 && (
              <div className="flex flex-col justify-center items-center gap-4 h-full border rounded-lg p-4">
                <p className="text-2xl">You have no words to review</p>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/">Back to home</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/words">Go to word list</Link>
                  </Button>
                </div>
              </div>
            )}
            {wordsToReview.length > 0 && (
              <ReviewCarousel words={wordsToReview} />
            )}
          </div>
        </TabsContent>
        <TabsContent value="history">
          <ReviewHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewPage;
