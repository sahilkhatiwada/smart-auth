const bcrypt = require('bcrypt');

// In-memory user store (for demonstration; replace with DB in production)
const users = {};

// Simple in-memory rate limiter
const loginAttempts = {};
const RATE_LIMIT = 5; // max attempts
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function rateLimit(username) {
  const now = Date.now();
  if (!loginAttempts[username]) {
    loginAttempts[username] = [];
  }
  // Remove old attempts
  loginAttempts[username] = loginAttempts[username].filter(ts => now - ts < WINDOW_MS);
  if (loginAttempts[username].length >= RATE_LIMIT) {
    return false;
  }
  loginAttempts[username].push(now);
  return true;
}

async function register(username, password) {
  if (users[username]) throw new Error('User already exists');
  const hash = await bcrypt.hash(password, 10);
  users[username] = { password: hash };
  return true;
}

async function login(username, password) {
  if (!rateLimit(username)) throw new Error('Too many login attempts. Please try again later.');
  const user = users[username];
  if (!user) throw new Error('User not found');
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid password');
  return true;
}

module.exports = { register, login, _users: users, _loginAttempts: loginAttempts }; 