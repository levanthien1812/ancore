import { authenticateCronJobs } from "@/lib/actions/_helpers";
import { cleanupAbandonedQuizzes } from "@/lib/actions/quiz.actions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  authenticateCronJobs(request);
  try {
    const result = await cleanupAbandonedQuizzes();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { success: false, message: "Cron job failed." },
      { status: 500 },
    );
  }
}
