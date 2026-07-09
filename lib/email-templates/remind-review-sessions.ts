export const remindReviewSessionsTemplate = (info: {
  userName: string | null;
  dueCount: number;
}) => {
  return `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
                <h2 style="color: #3b82f6;">Keep the momentum going, ${info.userName || "Learner"}!</h2>
                <p>You have <strong>${info.dueCount}</strong> words waiting for review today.</p>
                <p>Consistent practice is the secret to moving words into your long-term memory.</p>
                <div style="margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/review" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Start Review Session</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="font-size: 12px; color: #6b7280;">You received this reminder because notifications are enabled in your settings.</p>
              </div>
            `;
};
