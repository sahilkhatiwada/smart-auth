import { mfaAuthenticate } from '../lib/mfa';
import * as passwordAuth from '../lib/passwordAuth';
import * as otpAuth from '../lib/otpAuth';
import * as magicLinkAuth from '../lib/magicLinkAuth';

declare const jest: any;

jest.mock('../lib/passwordAuth');
jest.mock('../lib/otpAuth');
jest.mock('../lib/magicLinkAuth');

(passwordAuth.login as jest.Mock).mockImplementation(async (username: string, password: string) => {
  if (password === 'correct') return true;
  throw new Error('Invalid password');
});
(otpAuth.generateOTP as jest.Mock).mockImplementation((username: string) => '123456');
(otpAuth.verifyOTP as jest.Mock).mockImplementation((username: string, otp: string) => {
  if (otp === '123456') return true;
  throw new Error('Invalid or expired OTP');
});
(magicLinkAuth.generateMagicLink as jest.Mock).mockImplementation((username: string, baseUrl: string) => 'http://test/link?token=abc');
(magicLinkAuth.verifyMagicLink as jest.Mock).mockImplementation((token: string) => {
  if (token === 'abc') return 'user';
  throw new Error('Invalid or expired magic link');
});

describe('mfaAuthenticate', () => {
  it('succeeds with password only', async () => {
    const result = await mfaAuthenticate({ username: 'user', password: 'correct' });
    expect(result.success).toBe(true);
  });

  it('requires OTP after password if useOTP is true', async () => {
    const result = await mfaAuthenticate({ username: 'user', password: 'correct', mfaOptions: { useOTP: true } });
    expect(result.next).toBe('otp');
    expect(result.otp).toBe('123456');
  });

  it('succeeds with correct OTP', async () => {
    const result = await mfaAuthenticate({ username: 'user', otp: '123456', mfaOptions: { useOTP: true } });
    expect(result.success).toBe(true);
  });

  it('requires Magic Link after password if useMagicLink is true', async () => {
    const result = await mfaAuthenticate({ username: 'user', password: 'correct', mfaOptions: { useMagicLink: true } });
    expect(result.next).toBe('magiclink');
    expect(result.link).toContain('http://test/link');
  });

  it('succeeds with correct Magic Link token', async () => {
    const result = await mfaAuthenticate({ username: 'user', magicToken: 'abc', mfaOptions: { useMagicLink: true } });
    expect(result.success).toBe(true);
  });

  it('fails with wrong password', async () => {
    const result = await mfaAuthenticate({ username: 'user', password: 'wrong' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid password');
  });

  it('fails with wrong OTP', async () => {
    const result = await mfaAuthenticate({ username: 'user', otp: 'wrong', mfaOptions: { useOTP: true } });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid or expired OTP');
  });

  it('fails with wrong Magic Link token', async () => {
    const result = await mfaAuthenticate({ username: 'user', magicToken: 'wrong', mfaOptions: { useMagicLink: true } });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid or expired magic link');
  });
}); 