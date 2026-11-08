import crypto from 'node:crypto';

export const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

export function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createResetToken() {
  const token = crypto.randomBytes(32).toString('hex');

  return {
    token,
    tokenHash: hashResetToken(token),
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  };
}
