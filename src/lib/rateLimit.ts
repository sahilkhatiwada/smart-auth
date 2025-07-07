import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

export interface RateLimitConfig {
  windowMs?: number;
  max?: number;
  keyFn?: (req: Request) => string;
  redis?: Redis.Redis;
  global?: boolean;
}

const memoryAttempts: Record<string, number[]> = {};

export function rateLimitMiddleware({ windowMs = 15 * 60 * 1000, max = 5, keyFn, redis, global }: RateLimitConfig = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    let key = 'global';
    if (!global) {
      // Default: per-user (by IP) and per-endpoint
      key = keyFn ? keyFn(req) : `${req.ip || req.headers['x-forwarded-for'] || 'global'}:${req.path}`;
    }
    const now = Date.now();
    if (redis) {
      // Distributed rate limiting with Redis
      const redisKey = `ratelimit:${key}`;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.pexpire(redisKey, windowMs);
      }
      if (count > max) {
        res.status(429).json({ error: 'Too many requests. Please try again later.' });
        return;
      }
      next();
    } else {
      // In-memory fallback
      if (!memoryAttempts[key]) memoryAttempts[key] = [];
      memoryAttempts[key] = memoryAttempts[key].filter(ts => now - ts < windowMs);
      if (memoryAttempts[key].length >= max) {
        res.status(429).json({ error: 'Too many requests. Please try again later.' });
        return;
      }
      memoryAttempts[key].push(now);
      next();
    }
  };
}

export const _memoryAttempts = memoryAttempts;

// Usage:
// app.use(rateLimitMiddleware({ max: 10, windowMs: 60000, redis }));
// app.use('/api', rateLimitMiddleware({ max: 5, keyFn: req => req.ip, global: false })); 