import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { Store } from '../src/store.mjs';

async function tempStore() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'nixonhouse-store-'));
  const store = new Store(dir, 1);
  await store.init();
  return { dir, store };
}

test('creates the first admin and forces a temporary password change', async () => {
  const { store } = await tempStore();

  const { user, temporaryPassword } = await store.createUser({
    username: 'Matt',
    displayName: 'Matt',
    role: 'admin',
    password: 'NH-temp-temp-temp-temp',
    mustChangePassword: true
  });

  assert.equal(user.username, 'matt');
  assert.equal(user.role, 'admin');
  assert.equal(user.mustChangePassword, true);
  assert.equal(temporaryPassword, 'NH-temp-temp-temp-temp');

  const authenticated = await store.authenticate('matt', 'NH-temp-temp-temp-temp');
  assert.equal(authenticated.username, 'matt');
  assert.equal(authenticated.mustChangePassword, true);
});

test('sessions return the active user and can be destroyed', async () => {
  const { store } = await tempStore();
  const { user } = await store.createUser({
    username: 'matt',
    role: 'admin',
    password: 'this-is-temporary',
    mustChangePassword: true
  });

  const token = await store.createSession(user.id);
  const session = await store.getSession(token);
  assert.equal(session.user.username, 'matt');
  assert.ok(session.session.csrfToken);

  await store.destroySession(token);
  assert.equal(await store.getSession(token), null);
});

test('resetting a password marks the user for another forced change', async () => {
  const { store } = await tempStore();
  const { user } = await store.createUser({
    username: 'guest',
    password: 'initial-password',
    mustChangePassword: false
  });

  const result = await store.resetPassword(user.id);
  assert.equal(result.user.mustChangePassword, true);
  assert.equal(await store.authenticate('guest', result.temporaryPassword).then((item) => item.username), 'guest');
});
