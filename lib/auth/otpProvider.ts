import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import OtpCode from "@/lib/models/OtpCode";

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Swap point for a real SMS/OTP provider (Firebase Auth, MSG91, Twilio Verify).
 * Replace the body of `deliver()` with the provider's send call — everything
 * else (hashing, expiry, verify, rate limiting) stays the same.
 */
async function deliver(phone: string, code: string) {
  if (process.env.OTP_PROVIDER === "console" || !process.env.OTP_PROVIDER) {
    console.log(`[otp] SMS to +91${phone}: your Aisaheb Agro OTP is ${code}`);
    return;
  }
  throw new Error(`Unknown OTP_PROVIDER: ${process.env.OTP_PROVIDER}`);
}

export async function requestOtp(phone: string) {
  await connectDB();
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);

  await OtpCode.findOneAndUpdate(
    { phone },
    { phone, codeHash, attempts: 0, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
    { upsert: true },
  );

  await deliver(phone, code);

  const isDev = process.env.NODE_ENV !== "production";
  return { devCode: isDev ? code : undefined };
}

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "expired" | "too_many_attempts" | "incorrect" };

export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResult> {
  await connectDB();
  const entry = await OtpCode.findOne({ phone });
  if (!entry) return { ok: false, reason: "not_found" };
  if (entry.expiresAt.getTime() < Date.now()) {
    await OtpCode.deleteOne({ phone });
    return { ok: false, reason: "expired" };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" };
  }

  const matches = await bcrypt.compare(code, entry.codeHash);
  if (!matches) {
    await OtpCode.updateOne({ phone }, { $inc: { attempts: 1 } });
    return { ok: false, reason: "incorrect" };
  }

  await OtpCode.deleteOne({ phone });
  return { ok: true };
}
