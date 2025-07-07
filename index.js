// Entry point for smart-auth package 
const passwordAuth = require('./lib/passwordAuth');
const otpAuth = require('./lib/otpAuth');
const oauthAuth = require('./lib/oauthAuth');
const magicLinkAuth = require('./lib/magicLinkAuth');
const tokenSessionManager = require('./lib/tokenSessionManager');
const encryption = require('./lib/encryption');

function setupSmartAuth({ oauthConfig } = {}) {
  if (oauthConfig) {
    oauthAuth.setupOAuth(oauthConfig);
  }
}

module.exports = {
  setupSmartAuth,
  passwordAuth,
  otpAuth,
  oauthAuth,
  magicLinkAuth,
  tokenSessionManager,
  encryption
}; 