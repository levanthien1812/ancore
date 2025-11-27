import { getRecentQuizzes } from "@/lib/actions/quiz.actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import { format } from "date-fns";

const RecentQuizzes = async () => {
  const recentQuizzes = await getRecentQuizzes();

  if (recentQuizzes.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        You haven&apos;t taken any quizzes yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentQuizzes.map((quiz) => (
        <Card key={quiz.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              Quiz from {format(quiz.createdAt, "MMMM do, yyyy")}
            </CardTitle>
            <CardDescription>
              {quiz.completedAt
                ? `Score: ${quiz.quizzesCompleted} correct`
                : "Incomplete"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/quizzes/${quiz.id}`}>View Details</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecentQuizzes;
