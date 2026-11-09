
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MAX_FAILED_LOGINS,
  LOCK_DURATION_MS,
  isAccountLocked,
  recordFailedLogin,
  clearFailedLogins
} from '../src/services/loginLockout.js';

function createUser() {
  return {
    failedLoginAttempts: 0,
    firstFailedLoginAt: null,
    lockUntil: null
  };
}

test('Account locks after 5 failed attempts', () => {
  const user = createUser();
  const now = new Date();

  for (let i = 0; i < MAX_FAILED_LOGINS; i++) {
    recordFailedLogin(user, now);
  }

  assert.equal(user.failedLoginAttempts, 5);
  assert.equal(isAccountLocked(user, now), true);
});

test('Account unlocks after 15 minutes', () => {
  const user = createUser();
  const now = new Date();

  for (let i = 0; i < 5; i++) {
    recordFailedLogin(user, now);
  }

  const later = new Date(
    now.getTime() + LOCK_DURATION_MS + 1000
  );

  assert.equal(isAccountLocked(user, later), false);
});

test('Successful login resets failed attempts', () => {
  const user = createUser();

  recordFailedLogin(user);
  recordFailedLogin(user);

  clearFailedLogins(user);

  assert.equal(user.failedLoginAttempts, 0);
  assert.equal(user.firstFailedLoginAt, null);
  assert.equal(user.lockUntil, null);
});

test('Lockout only affects the targeted account', () => {
  const user1 = createUser();
  const user2 = createUser();

  for (let i = 0; i < 5; i++) {
    recordFailedLogin(user1);
  }

  assert.equal(isAccountLocked(user1), true);
  assert.equal(isAccountLocked(user2), false);
});

