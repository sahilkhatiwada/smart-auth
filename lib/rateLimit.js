// Reusable rate limiting middleware (Express-style)
const attempts = {};

function rateLimitMiddleware({ windowMs = 15 * 60 * 1000, max = 5 } = {}) {
  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'global';
    const now = Date.now();
    if (!attempts[key]) attempts[key] = [];
    // Remove old attempts
    attempts[key] = attempts[key].filter(ts => now - ts < windowMs);
    if (attempts[key].length >= max) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }
    attempts[key].push(now);
    next();
  };
}

module.exports = { rateLimitMiddleware, _attempts: attempts }; 