// backend/src/middleware/rateLimiting.js
// Simple, reliable rate limiting using express-rate-limit.
// Replaces express-brute / express-brute-mongoose usage.

import rateLimit from 'express-rate-limit';

/**
 * General API limiter (apply to most API routes)
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // limit each IP to 100 requests per windowMs
  standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

/**
 * Login limiter — more strict to prevent brute-force attempts
 * skipSuccessfulRequests: true will not count successful logins
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // allow 5 attempts per IP per window
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  }
});

/**
 * Payment creation limiter — prevents spam/flooding of payments
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,                  // 20 payment attempts per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many payment attempts. Please try again later.'
  }
});

/**
 * Notes:
 * - For production, use a distributed store (Redis) to persist counters across instances.
 * - To use Redis, you can swap in rate-limit-redis or rate-limiter-flexible with a Redis store.
 */
