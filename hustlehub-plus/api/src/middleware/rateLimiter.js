
import { rateLimit } from 'express-rate-limit';
import config from '../config/env.js';

function logLimit(name) {
  return (req, res, next, options) => {
    req.log.warn({ event: 'rate_limit.exceeded', limiter: name, ip: req.ip }, 'Rate limit exceeded');
    res.status(options.statusCode).json(options.message);
  };
}

const windowMinutes = config.RATE_LIMIT_WINDOW_MINUTES;
const windowMs = windowMinutes * 60 * 1000;

const limits = [
  windowMinutes,
  config.LOGIN_RATE_LIMIT,
  config.REGISTER_RATE_LIMIT,
  config.BOOKING_RATE_LIMIT,
];

if (!limits.every((value) => Number.isSafeInteger(value) && value > 0)) {
  throw new Error('Rate limit settings must be positive whole numbers.');
}

export const loginLimiter = rateLimit({
  windowMs,
  limit: config.LOGIN_RATE_LIMIT,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: logLimit('login'),
  message: {
    error: `Too many login attempts. Please try again in ${windowMinutes} minutes.`,
  },
});

export const registerLimiter = rateLimit({
  windowMs,
  limit: config.REGISTER_RATE_LIMIT,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: logLimit('register'),
  message: {
    error: `Too many registration attempts. Please try again in ${windowMinutes} minutes.`,
  },
});

export const bookingLimiter = rateLimit({
  windowMs,
  limit: config.BOOKING_RATE_LIMIT,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: logLimit('booking'),
  message: {
    error: `Too many booking requests. Please try again in ${windowMinutes} minutes.`,
  },
});
