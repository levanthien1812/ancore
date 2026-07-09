export const emailVerificationTemplate = (info: {
  userName: string | null;
  email: string;
  token: string;
}) => {
  return `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
                <h2 style="color: #3b82f6;">Verify your email address, ${info.userName || "Learner"}!</h2>
                <p>Use the code below to verify your email address.</p>
                <div style="margin: 30px 0;">
                  <p style="font-size: 20px; color: #6b7280;">${info.token}</p>
                </div>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="font-size: 12px; color: #6b7280;">You received this email because you signed up for an account with this email address.</p>
              </div>
            `;
};
