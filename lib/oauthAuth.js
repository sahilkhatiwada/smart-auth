// OAuth module for smart-auth (Google, GitHub)
// Framework-agnostic: expects integration with Express or similar
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

function setupOAuth({ google, github }) {
  if (google) {
    passport.use(new GoogleStrategy(google,
      (accessToken, refreshToken, profile, done) => {
        // TODO: Link or create user in DB
        return done(null, profile);
      }
    ));
  }
  if (github) {
    passport.use(new GitHubStrategy(github,
      (accessToken, refreshToken, profile, done) => {
        // TODO: Link or create user in DB
        return done(null, profile);
      }
    ));
  }
}

// These are Express-style middleware; adapt as needed for your framework
function authenticateOAuth(provider) {
  return passport.authenticate(provider, { scope: ['email', 'profile'] });
}

function callbackOAuth(provider) {
  return passport.authenticate(provider, { failureRedirect: '/login', session: false });
}

module.exports = { setupOAuth, authenticateOAuth, callbackOAuth }; 