import passport from 'passport';
import { RequestHandler } from 'express';
import { StrategyOptions as GoogleOptions } from 'passport-google-oauth20';
import { StrategyOptions as GitHubOptions } from 'passport-github2';

interface OAuthConfig {
  google?: GoogleOptions;
  github?: GitHubOptions;
}

export function setupOAuth({ google, github }: OAuthConfig) {
  if (google) {
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    passport.use(new GoogleStrategy(google, (accessToken: string, refreshToken: string, profile: any, done: Function) => {
      return done(null, profile);
    }));
  }
  if (github) {
    const GitHubStrategy = require('passport-github2').Strategy;
    passport.use(new GitHubStrategy(github, (accessToken: string, refreshToken: string, profile: any, done: Function) => {
      return done(null, profile);
    }));
  }
}

export function authenticateOAuth(provider: string): RequestHandler {
  return passport.authenticate(provider, { scope: ['email', 'profile'] });
}

export function callbackOAuth(provider: string): RequestHandler {
  return passport.authenticate(provider, { failureRedirect: '/login', session: false });
} 