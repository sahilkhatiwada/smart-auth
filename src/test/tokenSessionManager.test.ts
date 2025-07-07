import * as tokenSessionManager from '../lib/tokenSessionManager';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

type Jwt = typeof jwt;

beforeEach(() => {
  Object.keys(tokenSessionManager._sessions).forEach(k => delete tokenSessionManager._sessions[k]);
});

describe('tokenSessionManager', () => {
  it('creates and verifies token', () => {
    (jwt.sign as jest.Mock).mockReturnValue('token');
    (jwt.verify as jest.Mock).mockReturnValue({ user: 'alice' });
    const token = tokenSessionManager.createToken({ user: 'alice' });
    expect(token).toBe('token');
    expect(tokenSessionManager.verifyToken('token')).toEqual({ user: 'alice' });
  });

  it('rejects invalid/expired token', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('fail'); });
    expect(() => tokenSessionManager.verifyToken('bad')).toThrow('Invalid or expired token');
  });

  it('creates, gets, and destroys session', () => {
    tokenSessionManager.createSession('sid', { foo: 1 });
    expect(tokenSessionManager.getSession('sid')).toEqual({ data: { foo: 1 }, created: expect.any(Number) });
    tokenSessionManager.destroySession('sid');
    expect(tokenSessionManager.getSession('sid')).toBeNull();
  });

  it('isolates sessions by ID', () => {
    tokenSessionManager.createSession('a', { x: 1 });
    tokenSessionManager.createSession('b', { y: 2 });
    expect(tokenSessionManager.getSession('a')).not.toEqual(tokenSessionManager.getSession('b'));
  });
}); 