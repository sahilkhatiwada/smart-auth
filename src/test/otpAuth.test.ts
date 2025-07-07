import * as otpAuth from '../lib/otpAuth';

declare const jest: any;

beforeEach(() => {
  Object.keys(otpAuth._otps).forEach(k => delete otpAuth._otps[k]);
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('otpAuth', () => {
  it('generates and verifies OTP', () => {
    const otp = otpAuth.generateOTP('user1');
    expect(otpAuth.verifyOTP('user1', otp)).toBe(true);
  });

  it('rejects wrong OTP', () => {
    otpAuth.generateOTP('user2');
    expect(() => otpAuth.verifyOTP('user2', '000000')).toThrow('Invalid OTP');
  });

  it('rejects expired OTP', () => {
    const otp = otpAuth.generateOTP('user3');
    jest.advanceTimersByTime(5 * 60 * 1000 + 1);
    expect(() => otpAuth.verifyOTP('user3', otp)).toThrow('OTP expired');
  });

  it('enforces one-time use', () => {
    const otp = otpAuth.generateOTP('user4');
    expect(otpAuth.verifyOTP('user4', otp)).toBe(true);
    expect(() => otpAuth.verifyOTP('user4', otp)).toThrow('No OTP requested');
  });
}); 