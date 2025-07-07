const magicLinkAuth = require('../lib/magicLinkAuth');

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
    jest.advanceTimersByTime(10 * 60 * 1000 + 1); // 10 min + 1ms
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

  it('rejects empty identifier', () => {
    expect(() => magicLinkAuth.generateMagicLink('', 'http://localhost')).toThrow();
  });

  it('overwrites previous link for same user', () => {
    const link1 = magicLinkAuth.generateMagicLink('user5', 'http://localhost');
    const link2 = magicLinkAuth.generateMagicLink('user5', 'http://localhost');
    const token1 = link1.split('token=')[1];
    const token2 = link2.split('token=')[1];
    expect(() => magicLinkAuth.verifyMagicLink(token1)).toThrow('Magic link not found or already used');
    expect(magicLinkAuth.verifyMagicLink(token2)).toBe('user5');
  });

  it('does not allow link reuse across users', () => {
    const link = magicLinkAuth.generateMagicLink('user6', 'http://localhost');
    const token = link.split('token=')[1];
    // Simulate different user
    expect(() => magicLinkAuth.verifyMagicLink(token.replace('user6', 'user7'))).toThrow();
  });

  it('handles rapid link requests (no race condition)', () => {
    for (let i = 0; i < 10; i++) {
      magicLinkAuth.generateMagicLink('user8', 'http://localhost');
    }
    const lastLink = magicLinkAuth.generateMagicLink('user8', 'http://localhost');
    const token = lastLink.split('token=')[1];
    expect(magicLinkAuth.verifyMagicLink(token)).toBe('user8');
  });

  it('rejects non-string/corrupted payloads', () => {
    expect(() => magicLinkAuth.verifyMagicLink(123)).toThrow();
    expect(() => magicLinkAuth.verifyMagicLink(null)).toThrow();
  });
}); 