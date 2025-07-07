const { rateLimitMiddleware, _attempts } = require('../lib/rateLimit');

beforeEach(() => {
  Object.keys(_attempts).forEach(k => delete _attempts[k]);
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('rateLimitMiddleware', () => {
  function getMockReq(ip = '1.2.3.4') { return { ip, headers: {} }; }
  function getMockRes() {
    return { status: jest.fn().mockReturnThis(), json: jest.fn() };
  }
  function getNext() { return jest.fn(); }

  it('allows requests under the limit', () => {
    const mw = rateLimitMiddleware({ windowMs: 1000, max: 2 });
    const req = getMockReq();
    const res = getMockRes();
    const next = getNext();
    mw(req, res, next); // 1st
    mw(req, res, next); // 2nd
    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('blocks requests over the limit', () => {
    const mw = rateLimitMiddleware({ windowMs: 1000, max: 2 });
    const req = getMockReq();
    const res = getMockRes();
    const next = getNext();
    mw(req, res, next); // 1st
    mw(req, res, next); // 2nd
    mw(req, res, next); // 3rd
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Too many requests') });
  });

  it('resets after window', () => {
    const mw = rateLimitMiddleware({ windowMs: 1000, max: 2 });
    const req = getMockReq();
    const res = getMockRes();
    const next = getNext();
    mw(req, res, next); // 1st
    mw(req, res, next); // 2nd
    jest.advanceTimersByTime(1001);
    mw(req, res, next); // should allow again
    expect(next).toHaveBeenCalledTimes(3);
  });

  it('separates rate limits by IP', () => {
    const mw = rateLimitMiddleware({ windowMs: 1000, max: 1 });
    const req1 = { ip: '1.1.1.1', headers: {} };
    const req2 = { ip: '2.2.2.2', headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    mw(req1, res, next);
    mw(req2, res, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('handles missing IP gracefully', () => {
    const mw = rateLimitMiddleware({ windowMs: 1000, max: 1 });
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('handles rapid requests without crashing', () => {
    const mw = rateLimitMiddleware({ windowMs: 1000, max: 100 });
    const req = { ip: '3.3.3.3', headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    for (let i = 0; i < 100; i++) mw(req, res, next);
    expect(next).toHaveBeenCalledTimes(100);
  });

  it('throws on invalid config', () => {
    expect(() => rateLimitMiddleware({ windowMs: -1, max: 0 })).not.toThrow();
  });
}); 