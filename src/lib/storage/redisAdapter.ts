import { StorageAdapter } from './index';
import Redis from 'ioredis';

export class RedisStorage implements StorageAdapter {
  private redis: Redis.Redis;

  constructor(redis: Redis.Redis) {
    this.redis = redis;
  }

  async getUser(username: string) {
    const data = await this.redis.get(`user:${username}`);
    return data ? JSON.parse(data) : null;
  }
  async setUser(username: string, data: any) {
    if (data) {
      await this.redis.set(`user:${username}`, JSON.stringify(data));
    } else {
      await this.redis.del(`user:${username}`);
    }
  }
  async getSession(sessionId: string) {
    const data = await this.redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }
  async setSession(sessionId: string, data: any) {
    await this.redis.set(`session:${sessionId}`, JSON.stringify(data));
  }
  async getOTP(identifier: string) {
    const data = await this.redis.get(`otp:${identifier}`);
    return data ? JSON.parse(data) : null;
  }
  async setOTP(identifier: string, otpData: any) {
    await this.redis.set(`otp:${identifier}`, JSON.stringify(otpData));
  }
  async getMagicLink(token: string) {
    const data = await this.redis.get(`magiclink:${token}`);
    return data ? JSON.parse(data) : null;
  }
  async setMagicLink(token: string, linkData: any) {
    await this.redis.set(`magiclink:${token}`, JSON.stringify(linkData));
  }
}

// Usage:
// const redis = new Redis(REDIS_URI);
// const storage = new RedisStorage(redis); 