import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables, check your .env file');
}

if (process.env.PORT && isNaN(Number(process.env.PORT))) {
    throw new Error('PORT must be a number, check your .env file');
}

export default {
    PORT: Number(process.env.PORT) || 5000,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
};