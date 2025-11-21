import ReviewCarousel from "@/components/review/review-carousel";
import { Button } from "@/components/ui/button";
import { getWordsToReview } from "@/lib/actions/word.actions";
import Link from "next/link";

const ReviewPage = async () => {
  const wordsToReview = await getWordsToReview();

  return (
    <div className="w-[440px] mx-auto">
      {wordsToReview.length === 0 && (
        <div className="flex flex-col justify-center items-center gap-4">
          <p className="text-2xl">You have no words to review</p>
          <div className="flex gap-2">
            <Button>
              <Link href={"/"}>Back to home</Link>
            </Button>
            <Button>
              <Link href={"/words"}>Go to word list</Link>
            </Button>
          </div>
        </div>
      )}
      <ReviewCarousel words={wordsToReview} />
    </div>
  );
};

export default ReviewPage;
