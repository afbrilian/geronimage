import rateLimit from 'express-rate-limit'
import type { Request } from 'express'

// Custom keyGenerator that uses Fly-Client-IP header if available (Fly.io specific)
// Falls back to standard IP detection for other environments
// This avoids the trust proxy validation warning while still working correctly
const keyGenerator = (req: Request): string => {
  // Fly.io sets Fly-Client-IP header which is more reliable and avoids proxy validation
  const flyClientIp = req.headers['fly-client-ip']
  if (flyClientIp && typeof flyClientIp === 'string') {
    return flyClientIp
  }
  // Fall back to standard IP detection (works with trust proxy: 1)
  return req.ip || req.socket?.remoteAddress || 'unknown'
}

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator, // Use custom keyGenerator for Fly.io compatibility
})

// Stricter limiter for generation endpoint
export const generationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60, // Limit each IP to 60 generation requests per hour
  message: 'Too many icon generation requests. Please try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count successful requests too
  keyGenerator, // Use custom keyGenerator for Fly.io compatibility
})

// Lenient limiter for status polling endpoint
// Allows frequent polling (every 2 seconds) without hitting limits
export const statusLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Allow up to 60 status checks per minute (1 per second)
  message: 'Too many status check requests. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  keyGenerator, // Use custom keyGenerator for Fly.io compatibility
})
