import { cleanupAbandonedQuizzes } from "@/lib/actions/quiz.actions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Secure the endpoint
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const result = await cleanupAbandonedQuizzes();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { success: false, message: "Cron job failed." },
      { status: 500 }
    );
  }
}
