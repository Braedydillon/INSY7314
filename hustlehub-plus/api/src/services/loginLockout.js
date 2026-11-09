
export const MAX_FAILED_LOGINS = 5;
export const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
export const LOCK_DURATION_MS = 15 * 60 * 1000;

export function isAccountLocked(user, now = new Date()) {
  return Boolean(
    user.lockUntil &&
    new Date(user.lockUntil).getTime() > now.getTime()
  );
}

export function recordFailedLogin(user, now = new Date()) {
  const firstAttempt = user.firstFailedLoginAt
    ? new Date(user.firstFailedLoginAt).getTime()
    : null;

  if (
    firstAttempt === null ||
    now.getTime() - firstAttempt >= ATTEMPT_WINDOW_MS
  ) {
    user.failedLoginAttempts = 0;
    user.firstFailedLoginAt = now;
  }

  user.failedLoginAttempts =
    (user.failedLoginAttempts ?? 0) + 1;

  if (user.failedLoginAttempts >= MAX_FAILED_LOGINS) {
    user.lockUntil = new Date(
      now.getTime() + LOCK_DURATION_MS
    );
    return true;
  }

  return false;
}

export function clearFailedLogins(user) {
  user.failedLoginAttempts = 0;
  user.firstFailedLoginAt = null;
  user.lockUntil = null;
}
