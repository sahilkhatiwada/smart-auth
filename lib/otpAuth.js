const crypto = require('crypto');

// In-memory OTP store (for demonstration; replace with DB or cache in production)
const otps = {};
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function generateOTP(identifier) {
  const otp = (crypto.randomInt(100000, 999999)).toString();
  const expires = Date.now() + OTP_EXPIRY_MS;
  otps[identifier] = { otp, expires };
  // In production, send OTP via email/SMS here
  return otp;
}

function verifyOTP(identifier, inputOtp) {
  const record = otps[identifier];
  if (!record) throw new Error('No OTP requested');
  if (Date.now() > record.expires) {
    delete otps[identifier];
    throw new Error('OTP expired');
  }
  if (record.otp !== inputOtp) throw new Error('Invalid OTP');
  delete otps[identifier]; // OTP can only be used once
  return true;
}

module.exports = { generateOTP, verifyOTP, _otps: otps }; 