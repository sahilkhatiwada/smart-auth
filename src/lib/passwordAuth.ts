import bcrypt from 'bcrypt';

interface User {
  password: string;
}

const users: Record<string, User> = {};
const loginAttempts: Record<string, number[]> = {};
const RATE_LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

function rateLimit(username: string): boolean {
  const now = Date.now();
  if (!loginAttempts[username]) {
    loginAttempts[username] = [];
  }
  loginAttempts[username] = loginAttempts[username].filter(ts => now - ts < WINDOW_MS);
  if (loginAttempts[username].length >= RATE_LIMIT) {
    return false;
  }
  loginAttempts[username].push(now);
  return true;
}

export async function register(username: string, password: string): Promise<boolean> {
  if (users[username]) throw new Error('User already exists');
  const hash = await bcrypt.hash(password, 10);
  users[username] = { password: hash };
  return true;
}

export async function login(username: string, password: string): Promise<boolean> {
  if (!rateLimit(username)) throw new Error('Too many login attempts. Please try again later.');
  const user = users[username];
  if (!user) throw new Error('User not found');
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid password');
  return true;
}

export const _users = users;
export const _loginAttempts = loginAttempts; 