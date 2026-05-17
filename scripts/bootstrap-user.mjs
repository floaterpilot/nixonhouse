#!/usr/bin/env node
import { config } from '../src/config.mjs';
import { Store } from '../src/store.mjs';
import { generateTempPassword, normalizeUsername } from '../src/security.mjs';

function getArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return '';
  return process.argv[index + 1] || '';
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

const username = normalizeUsername(getArg('username') || 'matt');
const displayName = getArg('display-name') || getArg('displayName') || username;
const password = getArg('password') || generateTempPassword();
const role = hasFlag('admin') ? 'admin' : getArg('role') || 'user';
const forceChange = hasFlag('force-change') || hasFlag('forceChange');

const store = new Store(config.dataDir, config.sessionDays);
await store.init();

const existing = await store.findUserByUsername(username);

if (existing) {
  await store.setPassword(existing.id, password, forceChange);
  await store.updateUser(existing.id, {
    displayName,
    role: role === 'admin' ? 'admin' : 'user',
    disabled: false
  });
  console.log(`Updated user: ${username}`);
} else {
  await store.createUser({
    username,
    displayName,
    role,
    password,
    mustChangePassword: forceChange
  });
  console.log(`Created user: ${username}`);
}

console.log(`Temporary password: ${password}`);
console.log(`Force change: ${forceChange ? 'yes' : 'no'}`);
