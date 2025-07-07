import jwt, { JwtPayload } from 'jsonwebtoken';

interface SessionData {
  data: any;
  created: number;
}

const sessions: Record<string, SessionData> = {};
const JWT_SECRET = 'supersecretkey';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// In-memory blacklist for revoked tokens (can be replaced with pluggable storage)
const revokedTokens = new Set<string>();

export function createAccessToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function createRefreshToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): JwtPayload | string {
  if (isTokenRevoked(token)) throw new Error('Token revoked');
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    throw new Error('Invalid or expired token');
  }
}

export function verifyRefreshToken(token: string): JwtPayload | string {
  if (isTokenRevoked(token)) throw new Error('Token revoked');
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    throw new Error('Invalid or expired refresh token');
  }
}

export function revokeToken(token: string): void {
  revokedTokens.add(token);
}

export function isTokenRevoked(token: string): boolean {
  return revokedTokens.has(token);
}

export function createSession(sessionId: string, data: any): boolean {
  sessions[sessionId] = { data, created: Date.now() };
  return true;
}

export function getSession(sessionId: string): SessionData | null {
  return sessions[sessionId] || null;
}

export function destroySession(sessionId: string): boolean {
  delete sessions[sessionId];
  return true;
}

export const _sessions = sessions;
export const _revokedTokens = revokedTokens;

// Usage:
// const accessToken = createAccessToken({ userId: 123 });
// const refreshToken = createRefreshToken({ userId: 123 });
// verifyAccessToken(accessToken);
// verifyRefreshToken(refreshToken);
// revokeToken(accessToken); 