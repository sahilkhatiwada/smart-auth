const crypto = require('crypto');
const { encrypt, decrypt } = require('./encryption');

// In-memory store for magic links (for demonstration; use DB or cache in production)
const magicLinks = {};
const MAGIC_LINK_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

function generateMagicLink(identifier, baseUrl) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + MAGIC_LINK_EXPIRY_MS;
  const payload = encrypt(JSON.stringify({ identifier, token, expires }));
  magicLinks[token] = { identifier, expires };
  // In production, send `${baseUrl}?token=${encodeURIComponent(payload)}` via email
  return `${baseUrl}?token=${encodeURIComponent(payload)}`;
}

function verifyMagicLink(payload) {
  let data;
  try {
    data = JSON.parse(decrypt(payload));
  } catch (e) {
    throw new Error('Invalid or corrupted magic link');
  }
  const { identifier, token, expires } = data;
  if (!magicLinks[token]) throw new Error('Magic link not found or already used');
  if (Date.now() > expires) {
    delete magicLinks[token];
    throw new Error('Magic link expired');
  }
  delete magicLinks[token]; // One-time use
  return identifier;
}

module.exports = { generateMagicLink, verifyMagicLink, _magicLinks: magicLinks }; 