import { MasteryLevel } from "@prisma/client";
import { REVIEW_MASTERY_WEIGHTS } from "../constants/constant";

type ReviewPlanItem = {
  level: MasteryLevel;
  count: number;
};

export function getReviewPlan(
  includeWordLevels: MasteryLevel[],
  total: number,
  wordsByMasteryLevel: Record<MasteryLevel, number>,
): ReviewPlanItem[] {
  // 1. Filter out empty levels early (important)
  const activeLevels = includeWordLevels.filter(
    (l) => wordsByMasteryLevel[l] > 0,
  );

  if (activeLevels.length === 0) {
    return [];
  }

  // 2. Compute weighted distribution
  const totalWeight = activeLevels.reduce(
    (sum, level) => sum + REVIEW_MASTERY_WEIGHTS[level],
    0,
  );

  let used = 0;

  const initial: Array<ReviewPlanItem & { available: number }> =
    activeLevels.map((level) => {
      const desired = Math.floor(
        (REVIEW_MASTERY_WEIGHTS[level] / totalWeight) * total,
      );
      used += desired;

      return {
        level,
        count: desired,
        available: wordsByMasteryLevel[level],
      };
    });

  while (used !== total) {
    initial.forEach((item, index) => {
      if (index === 0 && used < total) {
        item.count++;
        used++;
      }
    });
  }

  console.log({ initial });

  // 3. Apply availability caps + compute leftover
  let leftover = 0;

  const capped = initial.map((item) => {
    const actual = Math.min(item.count, item.available);
    leftover += item.count - actual;

    return {
      level: item.level,
      count: actual,
      available: item.available,
    };
  });

  // 4. Redistribute leftover fairly
  while (leftover > 0) {
    let distributed = false;

    for (const item of capped) {
      if (leftover === 0) break;

      if (item.count < item.available) {
        item.count += 1;
        leftover--;
        distributed = true;
      }
    }

    // nothing more to distribute
    if (!distributed) break;
  }

  // 5. If still leftover (rare), fill greedily from any available space
  if (leftover > 0) {
    for (const item of capped) {
      while (leftover > 0 && item.count < item.available) {
        item.count++;
        leftover--;
      }
    }
  }

  return capped.map(({ level, count }) => ({
    level,
    count,
  }));
}
