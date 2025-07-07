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
}); 