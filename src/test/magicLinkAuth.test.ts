import * as magicLinkAuth from '../lib/magicLinkAuth';

declare const jest: any;

beforeEach(() => {
  Object.keys(magicLinkAuth._magicLinks).forEach(k => delete magicLinkAuth._magicLinks[k]);
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('magicLinkAuth', () => {
  it('generates and verifies magic link', () => {
    const link = magicLinkAuth.generateMagicLink('user1', 'http://localhost');
    const token = link.split('token=')[1];
    expect(magicLinkAuth.verifyMagicLink(token)).toBe('user1');
  });

  it('rejects expired magic link', () => {
    const link = magicLinkAuth.generateMagicLink('user2', 'http://localhost');
    const token = link.split('token=')[1];
    jest.advanceTimersByTime(10 * 60 * 1000 + 1);
    expect(() => magicLinkAuth.verifyMagicLink(token)).toThrow('Magic link expired');
  });

  it('rejects reused magic link', () => {
    const link = magicLinkAuth.generateMagicLink('user3', 'http://localhost');
    const token = link.split('token=')[1];
    expect(magicLinkAuth.verifyMagicLink(token)).toBe('user3');
    expect(() => magicLinkAuth.verifyMagicLink(token)).toThrow('Magic link not found or already used');
  });

  it('rejects corrupted magic link', () => {
    expect(() => magicLinkAuth.verifyMagicLink('corrupted')).toThrow('Invalid or corrupted magic link');
  });
}); 