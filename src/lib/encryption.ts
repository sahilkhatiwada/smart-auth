import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.randomBytes(32);
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  if (typeof text !== 'string') throw new Error('Input must be a string');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(data: string): string {
  const [ivHex, encrypted] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
} 