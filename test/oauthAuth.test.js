const oauthAuth = require('../lib/oauthAuth');
const passport = require('passport');

jest.mock('passport');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
jest.mock('passport-google-oauth20', () => ({ Strategy: jest.fn() }));
jest.mock('passport-github2', () => ({ Strategy: jest.fn() }));

describe('oauthAuth', () => {
  it('exports setupOAuth, authenticateOAuth, and callbackOAuth as functions', () => {
    expect(typeof oauthAuth.setupOAuth).toBe('function');
    expect(typeof oauthAuth.authenticateOAuth).toBe('function');
    expect(typeof oauthAuth.callbackOAuth).toBe('function');
  });

  it('calls passport.use for Google and GitHub strategies', () => {
    passport.use.mockClear();
    oauthAuth.setupOAuth({
      google: { clientID: 'id', clientSecret: 'secret', callbackURL: 'url' },
      github: { clientID: 'id', clientSecret: 'secret', callbackURL: 'url' }
    });
    expect(passport.use).toHaveBeenCalledTimes(2);
    expect(GoogleStrategy).toHaveBeenCalled();
    expect(GitHubStrategy).toHaveBeenCalled();
  });

  it('authenticateOAuth and callbackOAuth return middleware functions', () => {
    const mw1 = oauthAuth.authenticateOAuth('google');
    const mw2 = oauthAuth.callbackOAuth('google');
    expect(typeof mw1).toBe('function');
    expect(typeof mw2).toBe('function');
  });
}); 