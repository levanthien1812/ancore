import { getWordsToReviewCount } from "@/lib/actions/word.actions";
import ReviewTabsWrapper from "@/components/review/review-tabs-wrapper";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const ReviewPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) => {
  const wordsToReviewCount = await getWordsToReviewCount();
  const params = await searchParams;
  const activeTab = params.tab || "start";

  return (
    <div className="sm:min-w-[520px] sm:max-w-[33%] mx-auto py-2 px-2 sm:px-4 flex flex-col h-full">
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <ReviewTabsWrapper count={wordsToReviewCount} activeTab={activeTab} />
      </Suspense>
    </div>
  );
};

export default ReviewPage;
