import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createResetToken,
  hashResetToken,
  RESET_TOKEN_TTL_MS,
} from '../src/services/resetTokens.js';

test('tokens are 64 hex characters', () => {
  assert.match(createResetToken().token, /^[0-9a-f]{64}$/);
});

test('every token is different', () => {
  assert.notEqual(createResetToken().token, createResetToken().token);
});

test('the stored hash matches the token, is not plain', () => {
  const { token, tokenHash } = createResetToken();
  assert.equal(tokenHash, hashResetToken(token));
  assert.notEqual(tokenHash, token);
});

test('tokens expire after 15 minutes', () => {
  const before = Date.now();
  const { expiresAt } = createResetToken();
  const ttl = expiresAt.getTime() - before;
  assert.ok(ttl >= RESET_TOKEN_TTL_MS - 1000 && ttl <= RESET_TOKEN_TTL_MS + 1000);
});
