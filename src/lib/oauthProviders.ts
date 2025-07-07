import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile, StrategyOptions as GoogleOptions } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile, StrategyOptions as GitHubOptions } from 'passport-github2';
import { Strategy as FacebookStrategy, Profile as FacebookProfile, StrategyOption as FacebookOptions } from 'passport-facebook';
import { Strategy as TwitterStrategy, Profile as TwitterProfile, StrategyOptions as TwitterOptions } from 'passport-twitter';
import { Strategy as LinkedInStrategy, Profile as LinkedInProfile, StrategyOption as LinkedInOptions } from 'passport-linkedin-oauth2';
import { Strategy as AppleStrategy, Profile as AppleProfile, StrategyOptions as AppleOptions } from 'passport-apple';
// New providers
import { Strategy as MicrosoftStrategy, Profile as MicrosoftProfile, StrategyOptions as MicrosoftOptions } from 'passport-microsoft';
import { Strategy as SlackStrategy, Profile as SlackProfile, StrategyOption as SlackOptions } from 'passport-slack';
import { Strategy as DiscordStrategy, Profile as DiscordProfile, StrategyOptions as DiscordOptions } from 'passport-discord';

interface AllOAuthConfig {
  google?: GoogleOptions;
  github?: GitHubOptions;
  facebook?: FacebookOptions;
  twitter?: TwitterOptions;
  linkedin?: LinkedInOptions;
  apple?: AppleOptions;
  microsoft?: MicrosoftOptions;
  slack?: SlackOptions;
  discord?: DiscordOptions;
  // For dynamic registration
  [provider: string]: any;
}

type AnyProfile = GoogleProfile | GitHubProfile | FacebookProfile | TwitterProfile | LinkedInProfile | AppleProfile | MicrosoftProfile | SlackProfile | DiscordProfile | any;

type StrategyCtor = new (options: any, verify: any) => any;

const providerMap: Record<string, { Strategy: StrategyCtor; configKey: string }> = {
  google: { Strategy: GoogleStrategy, configKey: 'google' },
  github: { Strategy: GitHubStrategy, configKey: 'github' },
  facebook: { Strategy: FacebookStrategy, configKey: 'facebook' },
  twitter: { Strategy: TwitterStrategy, configKey: 'twitter' },
  linkedin: { Strategy: LinkedInStrategy, configKey: 'linkedin' },
  apple: { Strategy: AppleStrategy, configKey: 'apple' },
  microsoft: { Strategy: MicrosoftStrategy, configKey: 'microsoft' },
  slack: { Strategy: SlackStrategy, configKey: 'slack' },
  discord: { Strategy: DiscordStrategy, configKey: 'discord' },
};

export function setupAllOAuth(config: AllOAuthConfig) {
  for (const provider in config) {
    if (providerMap[provider] && config[provider]) {
      passport.use(new providerMap[provider].Strategy(config[provider], oauthCallback));
    } else if (config[provider]?.Strategy) {
      // Dynamic registration: config[provider] = { Strategy, options }
      passport.use(new config[provider].Strategy(config[provider].options, oauthCallback));
    }
  }
}

function oauthCallback(accessToken: string, refreshToken: string, profile: AnyProfile, done: Function) {
  const user = mapOAuthProfile(profile);
  return done(null, user);
}

export function mapOAuthProfile(profile: AnyProfile) {
  return {
    id: profile.id,
    provider: profile.provider,
    displayName: (profile.displayName || (profile as any).username || ''),
    email: (profile.emails && profile.emails[0] && profile.emails[0].value) || '',
    avatar: (profile.photos && profile.photos[0] && profile.photos[0].value) || '',
    raw: profile
  };
}

// Usage:
// setupAllOAuth({ google: { ... }, microsoft: { ... }, custom: { Strategy: CustomStrategy, options: {...} } }) 