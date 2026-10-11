import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hustlehub';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables, check your .env file');
}

if (Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) {
  throw new Error('JWT_SECRET must be at least 32 bytes long')
}

if (process.env.PORT && isNaN(Number(process.env.PORT))) {
  throw new Error('PORT must be a number, check your .env file');
}

export default {
  PORT: Number(process.env.PORT) || 5000,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  MONGODB_URI: MONGODB_URI,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  RATE_LIMIT_WINDOW_MINUTES: Number(process.env.RATE_LIMIT_WINDOW_MINUTES ?? 15),
  LOGIN_RATE_LIMIT: Number(process.env.LOGIN_RATE_LIMIT ?? 10),
  REGISTER_RATE_LIMIT: Number(process.env.REGISTER_RATE_LIMIT ?? 20),
  BOOKING_RATE_LIMIT: Number(process.env.BOOKING_RATE_LIMIT ?? 20),
};
