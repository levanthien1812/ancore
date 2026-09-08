export const emailVerificationTemplate = (info: {
  userName: string | null;
  email: string;
  token: string;
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
            Verify your email address
          </h2>
          
          <p style="font-size: 15px; color: #475569; margin: 0 0 24px 0; text-align: center;">
            Hi <strong style="color: #0f172a;">${info.userName || "Learner"}</strong>, thanks for registering! Please use the verification code below to complete setting up your account:
          </p>

          <!-- Highlighted Token Block -->
          <div style="margin: 28px 0; text-align: center;">
            <div style="display: inline-block; background-color: #eef2ff; border: 2px dashed #6366f1; border-radius: 12px; padding: 18px 32px; box-shadow: inset 0 2px 4px 0 rgba(99, 102, 241, 0.06);">
              <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 32px; font-weight: 800; color: #4338ca; letter-spacing: 6px; display: inline-block;">${info.token}</span>
            </div>
            <p style="font-size: 13px; color: #64748b; margin-top: 12px; margin-bottom: 0;">
              This code is valid for ${info.tokenExpiresIn} minutes. Do not share this code with anyone.
            </p>
          </div>

          <!-- Divider -->
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 28px 0;" />

          <!-- Security Note -->
          <p style="font-size: 13px; color: #94a3b8; margin: 0; text-align: center;">
            If you didn't request this email, you can safely ignore it.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="max-width: 560px; margin: 20px auto 0 auto; text-align: center; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0;">You received this automated email because an account registration was initiated for ${info.email}.</p>
      </div>
    </div>
  `;
};
