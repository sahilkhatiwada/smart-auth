import * as passwordAuth from '../lib/passwordAuth';
import bcrypt from 'bcrypt';

jest.mock('bcrypt');

type Bcrypt = typeof bcrypt;

beforeEach(() => {
  Object.keys(passwordAuth._users).forEach(k => delete passwordAuth._users[k]);
  Object.keys(passwordAuth._loginAttempts).forEach(k => delete passwordAuth._loginAttempts[k]);
});

describe('passwordAuth', () => {
  it('registers a new user', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    await expect(passwordAuth.register('alice', 'pass')).resolves.toBe(true);
    expect(passwordAuth._users['alice'].password).toBe('hashed');
  });

  it('prevents duplicate registration', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    await passwordAuth.register('bob', 'pass');
    await expect(passwordAuth.register('bob', 'pass')).rejects.toThrow('User already exists');
  });

  it('logs in with correct password', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    await passwordAuth.register('carol', 'pass');
    await expect(passwordAuth.login('carol', 'pass')).resolves.toBe(true);
  });

  it('rejects login with wrong password', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await passwordAuth.register('dave', 'pass');
    await expect(passwordAuth.login('dave', 'wrong')).rejects.toThrow('Invalid password');
  });

  it('enforces rate limiting', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await passwordAuth.register('eve', 'pass');
    for (let i = 0; i < 5; i++) {
      try { await passwordAuth.login('eve', 'wrong'); } catch {}
    }
    await expect(passwordAuth.login('eve', 'wrong')).rejects.toThrow('Too many login attempts');
  });
}); 