import { createHash, randomBytes } from "crypto";

export const generateVerificationToken = () => {
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = createHash("sha256").update(token).digest("hex");
  return { token, hash };
};

export const generateResetPasswordToken = () => {
  const token = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(token).digest("hex");
  return { token, hash };
};
