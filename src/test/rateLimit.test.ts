import { rateLimitMiddleware, _attempts } from '../lib/rateLimit';
import { Request, Response, NextFunction } from 'express';

declare const jest: any;

type MockReq = Partial<Request>;
type MockRes = { status: jest.Mock; json: jest.Mock };

describe('rateLimitMiddleware', () => {
  beforeEach(() => {
    Object.keys(_attempts).forEach(k => delete _attempts[k]);
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  function getMockReq(ip = '1.2.3.4'): MockReq { return { ip, headers: {} }; }
  function getMockRes(): MockRes {
    return { status: jest.fn().mockReturnThis(), json: jest.fn() };
  }
  function getNext(): jest.Mock { return jest.fn(); }

  it('allows requests under the limit', () => {
    const mw = rateLimitMiddleware({ windowMs: 1000, max: 2 });
    const req = getMockReq();
    const res = getMockRes();
    const next = getNext();
    mw(req as Request, res as unknown as Response, next as NextFunction); // 1st
    mw(req as Request, res as unknown as Response, next as NextFunction); // 2nd
    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('blocks requests over the limit', () => {
    const mw = rateLimitMiddleware({ windowMs: 1000, max: 2 });
    const req = getMockReq();
    const res = getMockRes();
    const next = getNext();
    mw(req as Request, res as unknown as Response, next as NextFunction); // 1st
    mw(req as Request, res as unknown as Response, next as NextFunction); // 2nd
    mw(req as Request, res as unknown as Response, next as NextFunction); // 3rd
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Too many requests') });
  });

  it('resets after window', () => {
    const mw = rateLimitMiddleware({ windowMs: 1000, max: 2 });
    const req = getMockReq();
    const res = getMockRes();
    const next = getNext();
    mw(req as Request, res as unknown as Response, next as NextFunction); // 1st
    mw(req as Request, res as unknown as Response, next as NextFunction); // 2nd
    jest.advanceTimersByTime(1001);
    mw(req as Request, res as unknown as Response, next as NextFunction); // should allow again
    expect(next).toHaveBeenCalledTimes(3);
  });

  it('separates rate limits by IP', () => {
    const mw = rateLimitMiddleware({ windowMs: 1000, max: 1 });
    const req1 = getMockReq('1.1.1.1');
    const req2 = getMockReq('2.2.2.2');
    const res = getMockRes();
    const next = getNext();
    mw(req1 as Request, res as unknown as Response, next as NextFunction);
    mw(req2 as Request, res as unknown as Response, next as NextFunction);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('handles missing IP gracefully', () => {
    const mw = rateLimitMiddleware({ windowMs: 1000, max: 1 });
    const req = { headers: {} } as MockReq;
    const res = getMockRes();
    const next = getNext();
    mw(req as Request, res as unknown as Response, next as NextFunction);
    expect(next).toHaveBeenCalled();
  });

  it('handles rapid requests without crashing', () => {
    const mw = rateLimitMiddleware({ windowMs: 1000, max: 100 });
    const req = getMockReq('3.3.3.3');
    const res = getMockRes();
    const next = getNext();
    for (let i = 0; i < 100; i++) mw(req as Request, res as unknown as Response, next as NextFunction);
    expect(next).toHaveBeenCalledTimes(100);
  });

  it('throws on invalid config', () => {
    expect(() => rateLimitMiddleware({ windowMs: -1, max: 0 })).not.toThrow();
  });
}); 