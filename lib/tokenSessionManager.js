const jwt = require('jsonwebtoken');

// In-memory session store (for demonstration; use DB or cache in production)
const sessions = {};
const JWT_SECRET = 'supersecretkey'; // In production, use env variable
const TOKEN_EXPIRY = '1h';

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    throw new Error('Invalid or expired token');
  }
}

function createSession(sessionId, data) {
  sessions[sessionId] = { data, created: Date.now() };
  return true;
}

function getSession(sessionId) {
  return sessions[sessionId] || null;
}

function destroySession(sessionId) {
  delete sessions[sessionId];
  return true;
}

module.exports = {
  createToken,
  verifyToken,
  createSession,
  getSession,
  destroySession,
  _sessions: sessions
}; 