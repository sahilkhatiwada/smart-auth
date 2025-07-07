import { encrypt, decrypt } from './encryption';

const magicLinks: Record<string, { identifier: string; expires: number }> = {};
const MAGIC_LINK_EXPIRY_MS = 10 * 60 * 1000;

export function generateMagicLink(identifier: string, baseUrl: string): string {
  if (!identifier) throw new Error('Identifier required');
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const expires = Date.now() + MAGIC_LINK_EXPIRY_MS;
  const payload = encrypt(JSON.stringify({ identifier, token, expires }));
  magicLinks[token] = { identifier, expires };
  return `${baseUrl}?token=${encodeURIComponent(payload)}`;
}

export function verifyMagicLink(payload: string): string {
  let data: { identifier: string; token: string; expires: number };
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
  delete magicLinks[token];
  return identifier;
}

export const _magicLinks = magicLinks; 