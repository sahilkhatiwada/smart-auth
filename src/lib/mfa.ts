import * as passwordAuth from './passwordAuth';
import * as otpAuth from './otpAuth';
import * as magicLinkAuth from './magicLinkAuth';

interface MFAOptions {
  useOTP?: boolean;
  useMagicLink?: boolean;
  magicLinkBaseUrl?: string;
}

interface MFAInput {
  username: string;
  password?: string;
  otp?: string;
  magicToken?: string;
  mfaOptions?: MFAOptions;
}

interface MFAResult {
  success: boolean;
  next?: 'otp' | 'magiclink';
  message?: string;
  otp?: string;
  link?: string;
  error?: string;
}

export async function mfaAuthenticate({ username, password, otp, magicToken, mfaOptions = {} }: MFAInput): Promise<MFAResult> {
  if (password) {
    try {
      await passwordAuth.login(username, password);
    } catch (e) {
      return { success: false, error: 'Invalid password' };
    }
    if (mfaOptions.useOTP) {
      const generatedOtp = otpAuth.generateOTP(username);
      return { success: false, next: 'otp', message: 'OTP sent', otp: generatedOtp };
    }
    if (mfaOptions.useMagicLink) {
      const link = magicLinkAuth.generateMagicLink(username, mfaOptions.magicLinkBaseUrl || 'http://localhost');
      return { success: false, next: 'magiclink', message: 'Magic link sent', link };
    }
    return { success: true };
  }
  if (otp && mfaOptions.useOTP) {
    try {
      otpAuth.verifyOTP(username, otp);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Invalid or expired OTP' };
    }
  }
  if (magicToken && mfaOptions.useMagicLink) {
    try {
      magicLinkAuth.verifyMagicLink(magicToken);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Invalid or expired magic link' };
    }
  }
  return { success: false, error: 'Insufficient authentication data' };
} 