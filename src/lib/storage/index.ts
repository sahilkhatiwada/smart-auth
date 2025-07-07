export interface StorageAdapter {
  getUser(username: string): Promise<any>;
  setUser(username: string, data: any): Promise<void>;
  getSession(sessionId: string): Promise<any>;
  setSession(sessionId: string, data: any): Promise<void>;
  getOTP(identifier: string): Promise<any>;
  setOTP(identifier: string, otpData: any): Promise<void>;
  getMagicLink(token: string): Promise<any>;
  setMagicLink(token: string, linkData: any): Promise<void>;
}

export class MemoryStorage implements StorageAdapter {
  private users: Record<string, any> = {};
  private sessions: Record<string, any> = {};
  private otps: Record<string, any> = {};
  private magicLinks: Record<string, any> = {};

  async getUser(username: string) { return this.users[username] || null; }
  async setUser(username: string, data: any) { this.users[username] = data; }
  async getSession(sessionId: string) { return this.sessions[sessionId] || null; }
  async setSession(sessionId: string, data: any) { this.sessions[sessionId] = data; }
  async getOTP(identifier: string) { return this.otps[identifier] || null; }
  async setOTP(identifier: string, otpData: any) { this.otps[identifier] = otpData; }
  async getMagicLink(token: string) { return this.magicLinks[token] || null; }
  async setMagicLink(token: string, linkData: any) { this.magicLinks[token] = linkData; }
}

import { MongoStorage } from './mongoAdapter';
import { PostgresStorage } from './postgresAdapter';
import { RedisStorage } from './redisAdapter';

export type StorageType = 'memory' | 'mongodb' | 'postgres' | 'redis';

interface StorageFactoryConfig {
  type: StorageType;
  mongoDb?: any; // MongoDB Db instance
  pgPool?: any; // PostgreSQL Pool instance
  redis?: any; // Redis instance
}

export function createStorageAdapter(config: StorageFactoryConfig): StorageAdapter {
  switch (config.type) {
    case 'memory':
      return new MemoryStorage();
    case 'mongodb':
      if (!config.mongoDb) throw new Error('mongoDb instance required');
      return new MongoStorage(config.mongoDb);
    case 'postgres':
      if (!config.pgPool) throw new Error('pgPool instance required');
      return new PostgresStorage(config.pgPool);
    case 'redis':
      if (!config.redis) throw new Error('redis instance required');
      return new RedisStorage(config.redis);
    default:
      throw new Error('Unknown storage type: ' + config.type);
  }
}

// Usage:
// import { createStorageAdapter } from './storage';
// const storage = createStorageAdapter({ type: 'mongodb', mongoDb: db });

export { MongoStorage, PostgresStorage, RedisStorage }; 