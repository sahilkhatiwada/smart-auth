const tokenSessionManager = require('../lib/tokenSessionManager');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

beforeEach(() => {
  Object.keys(tokenSessionManager._sessions).forEach(k => delete tokenSessionManager._sessions[k]);
});

describe('tokenSessionManager', () => {
  it('creates and verifies token', () => {
    jwt.sign.mockReturnValue('token');
    jwt.verify.mockReturnValue({ user: 'alice' });
    const token = tokenSessionManager.createToken({ user: 'alice' });
    expect(token).toBe('token');
    expect(tokenSessionManager.verifyToken('token')).toEqual({ user: 'alice' });
  });

  it('rejects invalid/expired token', () => {
    jwt.verify.mockImplementation(() => { throw new Error('fail'); });
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