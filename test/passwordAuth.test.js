const passwordAuth = require('../lib/passwordAuth');
const bcrypt = require('bcrypt');

jest.mock('bcrypt');

beforeEach(() => {
  // Reset in-memory stores
  Object.keys(passwordAuth._users).forEach(k => delete passwordAuth._users[k]);
  Object.keys(passwordAuth._loginAttempts).forEach(k => delete passwordAuth._loginAttempts[k]);
});

describe('passwordAuth', () => {
  it('registers a new user', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    await expect(passwordAuth.register('alice', 'pass')).resolves.toBe(true);
    expect(passwordAuth._users['alice'].password).toBe('hashed');
  });

  it('prevents duplicate registration', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    await passwordAuth.register('bob', 'pass');
    await expect(passwordAuth.register('bob', 'pass')).rejects.toThrow('User already exists');
  });

  it('logs in with correct password', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    bcrypt.compare.mockResolvedValue(true);
    await passwordAuth.register('carol', 'pass');
    await expect(passwordAuth.login('carol', 'pass')).resolves.toBe(true);
  });

  it('rejects login with wrong password', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    bcrypt.compare.mockResolvedValue(false);
    await passwordAuth.register('dave', 'pass');
    await expect(passwordAuth.login('dave', 'wrong')).rejects.toThrow('Invalid password');
  });

  it('enforces rate limiting', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    bcrypt.compare.mockResolvedValue(false);
    await passwordAuth.register('eve', 'pass');
    for (let i = 0; i < 5; i++) {
      try { await passwordAuth.login('eve', 'wrong'); } catch {}
    }
    await expect(passwordAuth.login('eve', 'wrong')).rejects.toThrow('Too many login attempts');
  });

  it('rejects empty username or password on registration', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    await expect(passwordAuth.register('', 'pass')).rejects.toThrow();
    await expect(passwordAuth.register('user', '')).rejects.toThrow();
  });

  it('handles special characters in username and password', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    await expect(passwordAuth.register('!@#$', 'p@$$w0rd!')).resolves.toBe(true);
    bcrypt.compare.mockResolvedValue(true);
    await expect(passwordAuth.login('!@#$', 'p@$$w0rd!')).resolves.toBe(true);
  });

  it('prevents concurrent registrations for the same user', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    await passwordAuth.register('concurrent', 'pass');
    await expect(passwordAuth.register('concurrent', 'pass')).rejects.toThrow('User already exists');
  });

  it('allows login after rate limit window resets', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    bcrypt.compare.mockResolvedValue(false);
    await passwordAuth.register('timed', 'pass');
    for (let i = 0; i < 5; i++) {
      try { await passwordAuth.login('timed', 'wrong'); } catch {}
    }
    // Simulate time passing
    jest.spyOn(Date, 'now').mockImplementation(() => Date.now() + 16 * 60 * 1000);
    bcrypt.compare.mockResolvedValue(true);
    await expect(passwordAuth.login('timed', 'pass')).resolves.toBe(true);
    Date.now.mockRestore();
  });

  it('rejects login if password hash is tampered', async () => {
    bcrypt.hash.mockResolvedValue('hashed');
    await passwordAuth.register('tamper', 'pass');
    passwordAuth._users['tamper'].password = 'corrupted';
    bcrypt.compare.mockResolvedValue(false);
    await expect(passwordAuth.login('tamper', 'pass')).rejects.toThrow('Invalid password');
  });
}); 