import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  decryptSecret,
  encryptSecret,
  generateTempPassword,
  hashPassword,
  isValidUsername,
  verifyPassword
} from '../src/security.mjs';

test('passwords are hashed and verified with scrypt', async () => {
  const stored = await hashPassword('correct horse battery staple');

  assert.equal(stored.algorithm, 'scrypt');
  assert.equal(await verifyPassword('correct horse battery staple', stored), true);
  assert.equal(await verifyPassword('wrong password', stored), false);
});

test('temporary passwords are generated in a readable format', () => {
  assert.match(generateTempPassword(), /^NH-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/);
});

test('username validation allows simple account names only', () => {
  assert.equal(isValidUsername('matt'), true);
  assert.equal(isValidUsername('matt.nixon'), true);
  assert.equal(isValidUsername('ma'), false);
  assert.equal(isValidUsername('bad name'), false);
  assert.equal(isValidUsername('-startsbad'), false);
});

test('secrets can be encrypted and decrypted for local integrations', () => {
  const encrypted = encryptSecret('spotify-refresh-token', 'local-secret');

  assert.notEqual(encrypted.value, 'spotify-refresh-token');
  assert.equal(decryptSecret(encrypted, 'local-secret'), 'spotify-refresh-token');
});
