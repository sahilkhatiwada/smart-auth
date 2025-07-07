const otps: Record<string, { otp: string; expires: number }> = {};
const OTP_EXPIRY_MS = 5 * 60 * 1000;

export function generateOTP(identifier: string): string {
  if (!identifier) throw new Error('Identifier required');
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  const expires = Date.now() + OTP_EXPIRY_MS;
  otps[identifier] = { otp, expires };
  return otp;
}

export function verifyOTP(identifier: string, inputOtp: string): boolean {
  const record = otps[identifier];
  if (!record) throw new Error('No OTP requested');
  if (Date.now() > record.expires) {
    delete otps[identifier];
    throw new Error('OTP expired');
  }
  if (record.otp !== inputOtp) throw new Error('Invalid OTP');
  delete otps[identifier];
  return true;
}

export const _otps = otps; 