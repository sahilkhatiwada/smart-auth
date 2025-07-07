import { StorageAdapter } from './index';
import { MongoClient, Db, Collection } from 'mongodb';

export class MongoStorage implements StorageAdapter {
  private db: Db;
  private users: Collection;
  private sessions: Collection;
  private otps: Collection;
  private magicLinks: Collection;

  constructor(db: Db) {
    this.db = db;
    this.users = db.collection('users');
    this.sessions = db.collection('sessions');
    this.otps = db.collection('otps');
    this.magicLinks = db.collection('magicLinks');
  }

  async getUser(username: string) {
    return this.users.findOne({ username });
  }
  async setUser(username: string, data: any) {
    if (data) {
      await this.users.updateOne({ username }, { $set: { ...data, username } }, { upsert: true });
    } else {
      await this.users.deleteOne({ username });
    }
  }
  async getSession(sessionId: string) {
    return this.sessions.findOne({ sessionId });
  }
  async setSession(sessionId: string, data: any) {
    await this.sessions.updateOne({ sessionId }, { $set: { ...data, sessionId } }, { upsert: true });
  }
  async getOTP(identifier: string) {
    return this.otps.findOne({ identifier });
  }
  async setOTP(identifier: string, otpData: any) {
    await this.otps.updateOne({ identifier }, { $set: { ...otpData, identifier } }, { upsert: true });
  }
  async getMagicLink(token: string) {
    return this.magicLinks.findOne({ token });
  }
  async setMagicLink(token: string, linkData: any) {
    await this.magicLinks.updateOne({ token }, { $set: { ...linkData, token } }, { upsert: true });
  }
}

// Usage:
// const client = new MongoClient(MONGO_URI);
// await client.connect();
// const storage = new MongoStorage(client.db('smartauth')); 