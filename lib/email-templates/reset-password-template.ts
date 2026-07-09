export const resetPasswordTemplate = (info: {
  userName: string | null;
  email: string;
  resetPasswordUrl: string;
  tokenExpiresIn: number;
}) => {
  return `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
                <h2 style="color: #3b82f6;">Reset your password, ${info.userName || "Learner"}!</h2>
                <p>Click the button below to reset your password.</p>
                <div style="margin: 30px 0;">
                  <a href="${info.resetPasswordUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="font-size: 12px; color: #6b7280;">You received this email because you requested to reset your password.</p>
                <p style="font-size: 12px; color: #6b7280;">If you didn't request this, please ignore this email.</p>
                <p style="font-size: 12px; color: #6b7280;">This link will expire in ${info.tokenExpiresIn} minutes.</p>
              </div>
            `;
};
