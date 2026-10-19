import rateLimit from 'express-rate-limit';

// Rate limiting on sensitive authentication and bidding endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

export const bidRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit to 60 bids per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Bidding rate limit reached. Please allow a moment before submitting your next bid.' }
});
