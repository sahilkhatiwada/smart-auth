const passwordAuth = require('./passwordAuth');
const otpAuth = require('./otpAuth');
const magicLinkAuth = require('./magicLinkAuth');

/**
 * MFA flow: password -> OTP or Magic Link -> success
 * options: { useOTP: true, useMagicLink: false }
 */
async function mfaAuthenticate({ username, password, otp, magicToken, mfaOptions = {} }) {
  // Step 1: Password
  if (password) {
    try {
      await passwordAuth.login(username, password);
    } catch (e) {
      return { success: false, error: 'Invalid password' };
    }
    // If OTP is required
    if (mfaOptions.useOTP) {
      // In production, send OTP here
      const generatedOtp = otpAuth.generateOTP(username);
      return { success: false, next: 'otp', message: 'OTP sent', otp: generatedOtp };
    }
    // If Magic Link is required
    if (mfaOptions.useMagicLink) {
      // In production, send Magic Link here
      const link = magicLinkAuth.generateMagicLink(username, mfaOptions.magicLinkBaseUrl || 'http://localhost');
      return { success: false, next: 'magiclink', message: 'Magic link sent', link };
    }
    // No MFA required
    return { success: true };
  }
  // Step 2: OTP
  if (otp && mfaOptions.useOTP) {
    try {
      otpAuth.verifyOTP(username, otp);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Invalid or expired OTP' };
    }
  }
  // Step 3: Magic Link
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

module.exports = { mfaAuthenticate }; 