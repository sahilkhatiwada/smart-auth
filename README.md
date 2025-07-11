# smart-auth

[![npm version](https://img.shields.io/npm/v/smart-auth.svg)](https://www.npmjs.com/package/smart-auth)
[![Build Status](https://img.shields.io/github/workflow/status/yourusername/smart-auth/CI)](https://github.com/yourusername/smart-auth/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Universal authentication system for Node.js supporting password, OTP, OAuth, Magic Link, encryption, rate limiting, and token/session management—all in one seamless package. Built for security, extensibility, and developer happiness.

## Features
- Password-based authentication with encryption and rate limiting
- OTP (One-Time Password) authentication
- OAuth (Google, GitHub, Facebook, Twitter, LinkedIn, Apple, Microsoft, Slack, Discord, etc.)
- Magic Link authentication
- Built-in encryption utilities
- Rate limiting middleware
- Token and session manager (JWT, in-memory, Redis, etc.)
- Pluggable storage adapters (Memory, MongoDB, PostgreSQL, Redis)
- RBAC and user management APIs
- Audit logging
- Internationalization (i18n)
- TypeScript support

---

## Installation

```bash
npm install smart-auth
```

---

## Usage Examples

### Setup
```ts
import smartAuth from 'smart-auth';

// Optional: Setup OAuth providers
smartAuth.setupSmartAuth({
  oauthConfig: {
    google: { clientID: '...', clientSecret: '...', callbackURL: '...' },
    github: { clientID: '...', clientSecret: '...', callbackURL: '...' }
  }
});
```

### Password Authentication
```ts
// Register
await smartAuth.passwordAuth.register('user', 'password');
// Login
await smartAuth.passwordAuth.login('user', 'password');
```

### OTP Authentication
```ts
// Generate OTP (send via SMS/email in production)
const otp = smartAuth.otpAuth.generateOTP('user@example.com');
// Verify OTP
smartAuth.otpAuth.verifyOTP('user@example.com', otp);
```

### OAuth Authentication (Express example)
```ts
import express from 'express';
import passport from 'passport';
const app = express();

app.get('/auth/google', smartAuth.oauthAuth.authenticateOAuth('google'));
app.get('/auth/google/callback', smartAuth.oauthAuth.callbackOAuth('google'), (req, res) => {
  // Handle successful login
});
```

### Magic Link Authentication
```ts
// Generate magic link (send via email in production)
const link = smartAuth.magicLinkAuth.generateMagicLink('user@example.com', 'https://yourapp.com/magic');
// Verify magic link (on callback route)
const identifier = smartAuth.magicLinkAuth.verifyMagicLink(tokenFromUrl);
```

### Token & Session Manager
```ts
// Create JWT token
const token = smartAuth.tokenSessionManager.createToken({ userId: 123 });
// Verify JWT token
const payload = smartAuth.tokenSessionManager.verifyToken(token);
// Create session
smartAuth.tokenSessionManager.createSession('sessionId', { userId: 123 });
// Get session
const session = smartAuth.tokenSessionManager.getSession('sessionId');
// Destroy session
smartAuth.tokenSessionManager.destroySession('sessionId');
```

### Encryption Utility
```ts
const { encrypt, decrypt } = smartAuth.encryption;
const encrypted = encrypt('secret');
const decrypted = decrypt(encrypted);
```

### Rate Limiting Middleware (Express example)
```ts
const { rateLimitMiddleware } = smartAuth;
app.use(rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 5 }));
```

---

## API Reference

### `passwordAuth`
- `register(username: string, password: string): Promise<void>`
- `login(username: string, password: string): Promise<User>`

### `otpAuth`
- `generateOTP(identifier: string): string`
- `verifyOTP(identifier: string, otp: string): boolean`

### `oauthAuth`
- `authenticateOAuth(provider: string): Middleware`
- `callbackOAuth(provider: string): Middleware`

### `magicLinkAuth`
- `generateMagicLink(email: string, redirectUrl: string): string`
- `verifyMagicLink(token: string): string | null`

### `tokenSessionManager`
- `createToken(payload: object): string`
- `verifyToken(token: string): object | null`
- `createSession(sessionId: string, data: object): void`
- `getSession(sessionId: string): object | null`
- `destroySession(sessionId: string): void`

### `encryption`
- `encrypt(data: string): string`
- `decrypt(data: string): string`

### `rateLimitMiddleware`
- `rateLimitMiddleware(options: RateLimitOptions): Middleware`

---

## Contributing

Contributions, issues, and feature requests are welcome! Please open an issue or submit a pull request.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

---

## License
MIT

---

Ideal for startups, APIs, and full-stack apps looking to streamline auth without compromising on security.
