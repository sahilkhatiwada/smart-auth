import { createStorageAdapter, StorageAdapter } from './storage';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export interface UserProfile {
  name?: string;
  avatar?: string;
  [key: string]: any;
}

export interface User {
  password: string;
  email: string;
  verified: boolean;
  blocked: boolean;
  roles: string[];
  profile?: UserProfile;
  metadata?: Record<string, any>;
}

let storage: StorageAdapter = createStorageAdapter({ type: 'memory' });
export function setUserStorage(adapter: StorageAdapter) { storage = adapter; }

const emailVerifications: Record<string, string> = {};

export async function register(username: string, password: string, email: string): Promise<{ success: boolean; verifyToken: string }> {
  if (!username || !password || !email) throw new Error('Missing fields');
  if (await storage.getUser(username)) throw new Error('User already exists');
  const hash = await bcrypt.hash(password, 10);
  await storage.setUser(username, { password: hash, email, verified: false, blocked: false, roles: ['user'], profile: {}, metadata: {} });
  const token = crypto.randomBytes(16).toString('hex');
  emailVerifications[token] = username;
  return { success: true, verifyToken: token };
}

export async function verifyEmail(token: string): Promise<{ success: boolean }> {
  const username = emailVerifications[token];
  if (!username) throw new Error('Invalid or expired token');
  const user = await storage.getUser(username);
  if (!user) throw new Error('User not found');
  user.verified = true;
  await storage.setUser(username, user);
  delete emailVerifications[token];
  return { success: true };
}

export async function login(username: string, password: string): Promise<{ success: boolean }> {
  const user = await storage.getUser(username);
  if (!user) throw new Error('User not found');
  if (user.blocked) throw new Error('User is blocked');
  if (!user.verified) throw new Error('Email not verified');
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid password');
  return { success: true };
}

const resetTokens: Record<string, string> = {};
export async function requestPasswordReset(username: string): Promise<{ success: boolean; resetToken: string }> {
  const user = await storage.getUser(username);
  if (!user) throw new Error('User not found');
  const token = crypto.randomBytes(16).toString('hex');
  resetTokens[token] = username;
  return { success: true, resetToken: token };
}
export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
  const username = resetTokens[token];
  if (!username) throw new Error('Invalid or expired token');
  const user = await storage.getUser(username);
  if (!user) throw new Error('User not found');
  user.password = await bcrypt.hash(newPassword, 10);
  await storage.setUser(username, user);
  delete resetTokens[token];
  return { success: true };
}

export async function blockUser(username: string): Promise<{ success: boolean }> {
  const user = await storage.getUser(username);
  if (!user) throw new Error('User not found');
  user.blocked = true;
  await storage.setUser(username, user);
  return { success: true };
}
export async function deleteUser(username: string): Promise<{ success: boolean }> {
  await storage.setUser(username, undefined as any);
  return { success: true };
}
export async function updateUserRoles(username: string, roles: string[]): Promise<{ success: boolean }> {
  const user = await storage.getUser(username);
  if (!user) throw new Error('User not found');
  user.roles = roles;
  await storage.setUser(username, user);
  return { success: true };
}

// New: Get and update user profile/metadata
export async function getUserProfile(username: string): Promise<{ profile: UserProfile; metadata: Record<string, any> }> {
  const user = await storage.getUser(username);
  if (!user) throw new Error('User not found');
  return { profile: user.profile || {}, metadata: user.metadata || {} };
}

export async function updateUserProfile(username: string, profile: Partial<UserProfile>, metadata?: Record<string, any>): Promise<{ success: boolean }> {
  const user = await storage.getUser(username);
  if (!user) throw new Error('User not found');
  user.profile = { ...user.profile, ...profile };
  if (metadata) user.metadata = { ...user.metadata, ...metadata };
  await storage.setUser(username, user);
  return { success: true };
}

// Usage:
// await updateUserProfile('alice', { name: 'Alice', avatar: 'url' }, { theme: 'dark' });
// const { profile, metadata } = await getUserProfile('alice'); 