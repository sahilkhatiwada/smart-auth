import { StorageAdapter } from './index';
import { Pool } from 'pg';

export class PostgresStorage implements StorageAdapter {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async getUser(username: string) {
    const res = await this.pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return res.rows[0] || null;
  }
  async setUser(username: string, data: any) {
    if (data) {
      await this.pool.query(
        'INSERT INTO users (username, data) VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET data = $2',
        [username, JSON.stringify(data)]
      );
    } else {
      await this.pool.query('DELETE FROM users WHERE username = $1', [username]);
    }
  }
  async getSession(sessionId: string) {
    const res = await this.pool.query('SELECT * FROM sessions WHERE session_id = $1', [sessionId]);
    return res.rows[0] || null;
  }
  async setSession(sessionId: string, data: any) {
    await this.pool.query(
      'INSERT INTO sessions (session_id, data) VALUES ($1, $2) ON CONFLICT (session_id) DO UPDATE SET data = $2',
      [sessionId, JSON.stringify(data)]
    );
  }
  async getOTP(identifier: string) {
    const res = await this.pool.query('SELECT * FROM otps WHERE identifier = $1', [identifier]);
    return res.rows[0] || null;
  }
  async setOTP(identifier: string, otpData: any) {
    await this.pool.query(
      'INSERT INTO otps (identifier, data) VALUES ($1, $2) ON CONFLICT (identifier) DO UPDATE SET data = $2',
      [identifier, JSON.stringify(otpData)]
    );
  }
  async getMagicLink(token: string) {
    const res = await this.pool.query('SELECT * FROM magic_links WHERE token = $1', [token]);
    return res.rows[0] || null;
  }
  async setMagicLink(token: string, linkData: any) {
    await this.pool.query(
      'INSERT INTO magic_links (token, data) VALUES ($1, $2) ON CONFLICT (token) DO UPDATE SET data = $2',
      [token, JSON.stringify(linkData)]
    );
  }
}

// Usage:
// const pool = new Pool({ connectionString: POSTGRES_URI });
// const storage = new PostgresStorage(pool); 