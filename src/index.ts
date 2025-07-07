export * as passwordAuth from './lib/passwordAuth';
export * as otpAuth from './lib/otpAuth';
export * as oauthAuth from './lib/oauthAuth';
export * as magicLinkAuth from './lib/magicLinkAuth';
export * as tokenSessionManager from './lib/tokenSessionManager';
export * as encryption from './lib/encryption';
export * as rateLimit from './lib/rateLimit';
export * as mfa from './lib/mfa';
export * as userApi from './lib/userApi';
export * as notify from './lib/notify';
export * as oauthProviders from './lib/oauthProviders';
export * as storage from './lib/storage';

import { setupOAuth } from './lib/oauthAuth';

export function setupSmartAuth({ oauthConfig }: { oauthConfig?: any } = {}) {
  if (oauthConfig) {
    setupOAuth(oauthConfig);
  }
} 