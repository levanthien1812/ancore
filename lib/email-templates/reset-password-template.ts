export const resetPasswordTemplate = (info: {
  userName: string | null;
  email: string;
  resetPasswordUrl: string;
  tokenExpiresIn: number;
}) => {
  return `
    <div style="background-color: #f8fafc; padding: 40px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
        <!-- Top Accent Bar -->
        <div style="height: 6px; background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%);"></div>
        
        <div style="padding: 32px 28px;">
          <!-- Header Logo / Brand -->
          <div style="margin-bottom: 24px; text-align: center;">
            <span style="font-size: 20px; font-weight: 800; letter-spacing: 2px; color: #3b82f6; text-transform: uppercase;">ANCORE</span>
          </div>

          <!-- Main Heading -->
          <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; text-align: center;">
            Reset your password
          </h2>
          
          <p style="font-size: 15px; color: #475569; margin: 0 0 24px 0; text-align: center;">
            Hi <strong style="color: #0f172a;">${info.userName || "Learner"}</strong>, we received a request to reset your account password. Click the button below to choose a new password:
          </p>

          <!-- Action Button -->
          <div style="margin: 32px 0; text-align: center;">
            <a href="${info.resetPasswordUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
              Reset Password
            </a>
            <p style="font-size: 13px; color: #64748b; margin-top: 14px; margin-bottom: 0;">
              This link will expire in <strong>${info.tokenExpiresIn} minutes</strong>.
            </p>
          </div>

          <!-- Fallback Link -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-top: 24px;">
            <p style="font-size: 12px; color: #64748b; margin: 0 0 4px 0;">If the button doesn't work, copy and paste this link into your browser:</p>
            <a href="${info.resetPasswordUrl}" style="font-size: 12px; color: #3b82f6; word-break: break-all; text-decoration: underline;">${info.resetPasswordUrl}</a>
          </div>

          <!-- Divider -->
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 28px 0;" />

          <!-- Security Note -->
          <p style="font-size: 13px; color: #94a3b8; margin: 0; text-align: center;">
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="max-width: 560px; margin: 20px auto 0 auto; text-align: center; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0;">You received this automated email because a password reset request was made for ${info.email}.</p>
      </div>
    </div>
  `;
};

