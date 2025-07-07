const otpAuth = require('../lib/otpAuth');

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
    jest.advanceTimersByTime(5 * 60 * 1000 + 1); // 5 min + 1ms
    expect(() => otpAuth.verifyOTP('user3', otp)).toThrow('OTP expired');
  });

  it('enforces one-time use', () => {
    const otp = otpAuth.generateOTP('user4');
    expect(otpAuth.verifyOTP('user4', otp)).toBe(true);
    expect(() => otpAuth.verifyOTP('user4', otp)).toThrow('No OTP requested');
  });

  it('rejects empty identifier', () => {
    expect(() => otpAuth.generateOTP('')).toThrow();
  });

  it('overwrites previous OTP for same user', () => {
    const otp1 = otpAuth.generateOTP('user5');
    const otp2 = otpAuth.generateOTP('user5');
    expect(() => otpAuth.verifyOTP('user5', otp1)).toThrow('Invalid OTP');
    expect(otpAuth.verifyOTP('user5', otp2)).toBe(true);
  });

  it('does not allow OTP reuse across users', () => {
    const otp = otpAuth.generateOTP('user6');
    expect(() => otpAuth.verifyOTP('user7', otp)).toThrow('No OTP requested');
  });

  it('handles rapid OTP requests (no race condition)', () => {
    for (let i = 0; i < 10; i++) {
      otpAuth.generateOTP('user8');
    }
    const lastOtp = otpAuth.generateOTP('user8');
    expect(otpAuth.verifyOTP('user8', lastOtp)).toBe(true);
  });

  it('rejects non-string OTP input', () => {
    otpAuth.generateOTP('user9');
    expect(() => otpAuth.verifyOTP('user9', 123456)).toThrow();
    expect(() => otpAuth.verifyOTP('user9', null)).toThrow();
  });
}); 