// Rate limiting middleware for admin routes
// Note: This requires express-rate-limit package
// Install with: npm install express-rate-limit

// Simple in-memory rate limiting (basic implementation)
// For production, consider using express-rate-limit package

const rateLimitMap = new Map();

export const adminRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Max 100 requests per window

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const limitData = rateLimitMap.get(ip);

  if (now > limitData.resetTime) {
    // Reset the limit
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (limitData.count >= maxRequests) {
    return res.status(429).json({
      message: "Too many requests from this IP, please try again later.",
      retryAfter: Math.ceil((limitData.resetTime - now) / 1000), // seconds
    });
  }

  limitData.count++;
  next();
};

// Strict rate limiter for admin login - prevent brute force attacks
export const adminLoginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5; // Max 5 login attempts per window

  const key = `login:${ip}`;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const limitData = rateLimitMap.get(key);

  if (now > limitData.resetTime) {
    // Reset the limit
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (limitData.count >= maxRequests) {
    return res.status(429).json({
      message: "Too many login attempts, please try again after 15 minutes.",
      retryAfter: Math.ceil((limitData.resetTime - now) / 1000), // seconds
    });
  }

  limitData.count++;
  next();
};

// Clean up old entries periodically (every hour)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 60 * 1000); // Run every hour
