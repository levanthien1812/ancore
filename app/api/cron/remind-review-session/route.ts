import { authenticateCronJobs } from "@/lib/actions/_helpers";
import { sendEmailRemindReviewSessions } from "@/lib/actions/review.actions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authError = await authenticateCronJobs(request);
  if (authError) return authError;

  try {
    const result = await sendEmailRemindReviewSessions();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Reminder cron failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during reminder cron.",
      },
      { status: 500 },
    );
  }
}
