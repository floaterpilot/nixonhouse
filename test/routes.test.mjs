import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

import { config } from '../src/config.mjs';
import { Store } from '../src/store.mjs';
import { createApp } from '../server.mjs';

let baseUrl;
let server;
let store;

function form(data) {
  return new URLSearchParams(data);
}

function cookieFrom(response) {
  return response.headers.get('set-cookie')?.split(';')[0] || '';
}

before(async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'nixonhouse-routes-'));
  store = new Store(dir, 1);
  await store.init();

  await store.createUser({
    username: 'matt',
    role: 'admin',
    password: 'admin-password-123',
    mustChangePassword: false
  });

  await store.createUser({
    username: 'guest',
    role: 'user',
    password: 'guest-password-123',
    mustChangePassword: false
  });

  await store.createUser({
    username: 'temp',
    role: 'user',
    password: 'temp-password-123',
    mustChangePassword: true
  });

  server = createApp({
    cfg: {
      ...config,
      publicUrl: 'http://127.0.0.1',
      cookieSecure: false
    },
    store
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('landing page is public and protected pages redirect to login', async () => {
  const landing = await fetch(`${baseUrl}/`);
  assert.equal(landing.status, 200);
  assert.match(await landing.text(), /Nixon House/);

  const head = await fetch(`${baseUrl}/`, { method: 'HEAD' });
  assert.equal(head.status, 200);

  const dashboard = await fetch(`${baseUrl}/dashboard`, { redirect: 'manual' });
  assert.equal(dashboard.status, 303);
  assert.equal(dashboard.headers.get('location'), '/login');

  const signup = await fetch(`${baseUrl}/signup`);
  assert.equal(signup.status, 404);
});

test('temporary users are forced to change password after login', async () => {
  const response = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    body: form({ username: 'temp', password: 'temp-password-123' }),
    redirect: 'manual'
  });

  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/change-password');
});

test('admin users can reach admin while normal users cannot', async () => {
  const adminLogin = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    body: form({ username: 'matt', password: 'admin-password-123' }),
    redirect: 'manual'
  });
  const adminCookie = cookieFrom(adminLogin);
  assert.ok(adminCookie);

  const adminPage = await fetch(`${baseUrl}/admin`, {
    headers: { cookie: adminCookie }
  });
  assert.equal(adminPage.status, 200);
  assert.match(await adminPage.text(), /Add user/);

  const dashboard = await fetch(`${baseUrl}/dashboard`, {
    headers: { cookie: adminCookie }
  });
  const dashboardHtml = await dashboard.text();
  assert.equal(dashboard.status, 200);
  assert.match(dashboardHtml, /Spotify/);
  assert.match(dashboardHtml, /9to5Mac/);
  assert.match(dashboardHtml, /Game strip/);
  assert.doesNotMatch(dashboardHtml, /Downloads/);

  const weather = await fetch(`${baseUrl}/weather`, {
    headers: { cookie: adminCookie }
  });
  assert.equal(weather.status, 200);
  assert.match(await weather.text(), /Radar/);

  const userLogin = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    body: form({ username: 'guest', password: 'guest-password-123' }),
    redirect: 'manual'
  });
  const userCookie = cookieFrom(userLogin);
  assert.ok(userCookie);

  const blocked = await fetch(`${baseUrl}/admin`, {
    headers: { cookie: userCookie }
  });
  assert.equal(blocked.status, 403);
});
