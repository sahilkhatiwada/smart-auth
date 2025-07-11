import * as oauthAuth from '../lib/oauthAuth';
import passport from 'passport';

declare const jest: any;

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
    (passport.use as jest.Mock).mockClear();
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

  it('does not call passport.use if no config is provided', () => {
    (passport.use as jest.Mock).mockClear();
    oauthAuth.setupOAuth({});
    expect(passport.use).not.toHaveBeenCalled();
  });

  it('authenticateOAuth and callbackOAuth handle unknown provider', () => {
    const mw1 = oauthAuth.authenticateOAuth('unknown');
    const mw2 = oauthAuth.callbackOAuth('unknown');
    expect(typeof mw1).toBe('function');
    expect(typeof mw2).toBe('function');
  });
}); 