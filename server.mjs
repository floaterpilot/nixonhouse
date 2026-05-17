import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from './src/config.mjs';
import { getCubs } from './src/cubs.mjs';
import { getNews } from './src/news.mjs';
import { Store } from './src/store.mjs';
import { randomId, verifyPassword } from './src/security.mjs';
import {
  exchangeSpotifyCode,
  getSpotifyNowPlaying,
  getSpotifyProfile,
  spotifyAuthorizeUrl,
  spotifyConfigured,
  spotifyConnectionFromTokenResponse
} from './src/spotify.mjs';
import { getWeather } from './src/weather.mjs';
import {
  adminPage,
  changePasswordPage,
  dashboardPage,
  landingPage,
  loginPage,
  notFoundPage,
  weatherPage
} from './src/templates.mjs';

const SESSION_COOKIE = 'nixonhouse_session';
const STATIC_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        if (index === -1) return [part, ''];
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.path) parts.push(`Path=${options.path}`);
  return parts.join('; ');
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'content-type': 'text/html; charset=utf-8',
    ...headers
  });
  res.end(res.shouldOmitBody ? undefined : body);
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(res.shouldOmitBody ? undefined : JSON.stringify(data));
}

function redirect(res, location, headers = {}) {
  res.writeHead(303, {
    location,
    ...headers
  });
  res.end();
}

async function parseForm(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }

  return Object.fromEntries(new URLSearchParams(Buffer.concat(chunks).toString('utf8')));
}

function sessionCookieHeader(token, cfg) {
  return serializeCookie(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    secure: cfg.cookieSecure,
    sameSite: 'Lax',
    maxAge: cfg.sessionDays * 24 * 60 * 60
  });
}

function clearSessionCookieHeader(cfg) {
  return serializeCookie(SESSION_COOKIE, '', {
    path: '/',
    httpOnly: true,
    secure: cfg.cookieSecure,
    sameSite: 'Lax',
    maxAge: 0
  });
}

async function contextFor(req, store, cfg) {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[SESSION_COOKIE];
  const sessionData = await store.getSession(token);

  return {
    token,
    session: sessionData?.session || null,
    user: sessionData?.user || null,
    spotifyConfigured: spotifyConfigured(cfg),
    csrfToken: sessionData?.session?.csrfToken || ''
  };
}

function csrfOk(ctx, form) {
  return Boolean(ctx.csrfToken && form.csrf && form.csrf === ctx.csrfToken);
}

async function serveStatic(req, res, cfg) {
  const url = new URL(req.url, cfg.publicUrl);
  const pathname = decodeURIComponent(url.pathname);

  if (!['/styles.css', '/app.js'].includes(pathname) && !pathname.startsWith('/assets/')) {
    return false;
  }

  const filePath = path.normalize(path.join(cfg.publicDir, pathname));
  if (!filePath.startsWith(cfg.publicDir)) {
    send(res, 403, 'Forbidden');
    return true;
  }

  try {
    const body = await fs.readFile(filePath);
    const type = STATIC_TYPES[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, {
      'content-type': type,
      'cache-control': pathname.startsWith('/assets/') ? 'public, max-age=86400' : 'no-cache'
    });
    res.end(res.shouldOmitBody ? undefined : body);
  } catch {
    send(res, 404, 'Not found');
  }

  return true;
}

function needsPasswordChange(ctx, pathname) {
  if (!ctx.user?.mustChangePassword) return false;
  return !['/change-password', '/logout'].includes(pathname);
}

export function createApp({ cfg = config, store } = {}) {
  store ||= new Store(cfg.dataDir, cfg.sessionDays);

  return http.createServer(async (req, res) => {
    try {
      res.shouldOmitBody = req.method === 'HEAD';
      if (await serveStatic(req, res, cfg)) return;

      const url = new URL(req.url, cfg.publicUrl);
      const ctx = await contextFor(req, store, cfg);
      const isRead = req.method === 'GET' || req.method === 'HEAD';

      if (needsPasswordChange(ctx, url.pathname)) {
        redirect(res, '/change-password');
        return;
      }

      if (isRead && url.pathname === '/') {
        send(res, 200, landingPage(ctx));
        return;
      }

      if (isRead && url.pathname === '/login') {
        if (ctx.user) {
          redirect(res, '/dashboard');
          return;
        }
        send(res, 200, loginPage(ctx));
        return;
      }

      if (req.method === 'POST' && url.pathname === '/login') {
        const form = await parseForm(req);
        const user = await store.authenticate(form.username, form.password);

        if (!user) {
          send(res, 401, loginPage(ctx, 'That username and password did not match.'));
          return;
        }

        const token = await store.createSession(user.id);
        redirect(res, user.mustChangePassword ? '/change-password' : '/dashboard', {
          'set-cookie': sessionCookieHeader(token, cfg)
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/logout') {
        if (ctx.token) await store.destroySession(ctx.token);
        redirect(res, '/', {
          'set-cookie': clearSessionCookieHeader(cfg)
        });
        return;
      }

      if (isRead && url.pathname === '/dashboard') {
        if (!ctx.user) {
          redirect(res, '/login');
          return;
        }
        send(res, 200, dashboardPage(ctx));
        return;
      }

      if (isRead && url.pathname === '/weather') {
        if (!ctx.user) {
          redirect(res, '/login');
          return;
        }
        send(res, 200, weatherPage(ctx));
        return;
      }

      if (isRead && url.pathname === '/spotify/connect') {
        if (!ctx.user) {
          redirect(res, '/login');
          return;
        }

        if (!spotifyConfigured(cfg)) {
          send(res, 501, dashboardPage(ctx));
          return;
        }

        const state = randomId('spotify');
        await store.setSessionOAuthState(ctx.token, 'spotify', state);
        redirect(res, spotifyAuthorizeUrl(cfg, state));
        return;
      }

      if (isRead && url.pathname === '/spotify/callback') {
        if (!ctx.user) {
          redirect(res, '/login');
          return;
        }

        if (!spotifyConfigured(cfg)) {
          send(res, 501, dashboardPage(ctx));
          return;
        }

        const stateOk = await store.consumeSessionOAuthState(ctx.token, 'spotify', url.searchParams.get('state'));
        if (!stateOk) {
          send(res, 403, dashboardPage(ctx));
          return;
        }

        if (url.searchParams.get('error')) {
          redirect(res, '/dashboard');
          return;
        }

        const code = url.searchParams.get('code');
        if (!code) {
          send(res, 400, dashboardPage(ctx));
          return;
        }

        const tokenPayload = await exchangeSpotifyCode(cfg, code);
        const profile = await getSpotifyProfile(tokenPayload.access_token);
        await store.updateUserIntegrations(ctx.user.id, {
          spotify: spotifyConnectionFromTokenResponse(cfg, tokenPayload, profile)
        });

        redirect(res, '/dashboard#spotify');
        return;
      }

      if (req.method === 'POST' && url.pathname === '/spotify/disconnect') {
        if (!ctx.user) {
          redirect(res, '/login');
          return;
        }

        const form = await parseForm(req);
        if (!csrfOk(ctx, form)) {
          send(res, 403, dashboardPage(ctx));
          return;
        }

        await store.updateUserIntegrations(ctx.user.id, { spotify: null });
        redirect(res, '/dashboard#spotify');
        return;
      }

      if (isRead && url.pathname === '/change-password') {
        if (!ctx.user) {
          redirect(res, '/login');
          return;
        }
        send(res, 200, changePasswordPage(ctx));
        return;
      }

      if (req.method === 'POST' && url.pathname === '/change-password') {
        if (!ctx.user) {
          redirect(res, '/login');
          return;
        }

        const form = await parseForm(req);
        if (!csrfOk(ctx, form)) {
          send(res, 403, changePasswordPage(ctx, 'Your session check failed. Please try again.', true));
          return;
        }

        const currentOk = await verifyPassword(form.currentPassword, ctx.user.passwordHash);
        if (!currentOk) {
          send(res, 400, changePasswordPage(ctx, 'The current password was not correct.', true));
          return;
        }

        if (!form.newPassword || form.newPassword.length < 12) {
          send(res, 400, changePasswordPage(ctx, 'Use at least 12 characters for the new password.', true));
          return;
        }

        if (form.newPassword !== form.confirmPassword) {
          send(res, 400, changePasswordPage(ctx, 'The new passwords did not match.', true));
          return;
        }

        await store.setPassword(ctx.user.id, form.newPassword, false);
        redirect(res, '/dashboard');
        return;
      }

      if (isRead && url.pathname === '/admin') {
        if (!ctx.user) {
          redirect(res, '/login');
          return;
        }

        if (ctx.user.role !== 'admin') {
          send(res, 403, notFoundPage(ctx));
          return;
        }

        send(res, 200, adminPage(ctx, { users: await store.getUsers() }));
        return;
      }

      if (req.method === 'POST' && url.pathname === '/admin/users') {
        if (!ctx.user) {
          redirect(res, '/login');
          return;
        }

        if (ctx.user.role !== 'admin') {
          send(res, 403, notFoundPage(ctx));
          return;
        }

        const form = await parseForm(req);
        const users = await store.getUsers();

        if (!csrfOk(ctx, form)) {
          send(res, 403, adminPage(ctx, { users, error: 'Your session check failed. Please try again.' }));
          return;
        }

        try {
          const result = await store.createUser({
            username: form.username,
            displayName: form.displayName,
            role: form.role,
            mustChangePassword: true
          });

          send(
            res,
            201,
            adminPage(ctx, {
              users: await store.getUsers(),
              notice: `Created ${result.user.username}. They will be forced to change this temporary password at first login.`,
              createdPassword: result.temporaryPassword
            })
          );
        } catch (error) {
          send(res, 400, adminPage(ctx, { users, error: error.message }));
        }
        return;
      }

      const resetMatch = url.pathname.match(/^\/admin\/users\/([^/]+)\/reset$/);
      if (req.method === 'POST' && resetMatch) {
        if (!ctx.user) {
          redirect(res, '/login');
          return;
        }

        if (ctx.user.role !== 'admin') {
          send(res, 403, notFoundPage(ctx));
          return;
        }

        const form = await parseForm(req);
        const users = await store.getUsers();

        if (!csrfOk(ctx, form)) {
          send(res, 403, adminPage(ctx, { users, error: 'Your session check failed. Please try again.' }));
          return;
        }

        const result = await store.resetPassword(resetMatch[1]);
        if (!result.user) {
          send(res, 404, adminPage(ctx, { users, error: 'That user was not found.' }));
          return;
        }

        send(
          res,
          200,
          adminPage(ctx, {
            users: await store.getUsers(),
            notice: `Reset ${result.user.username}. They must change the temporary password at next login.`,
            createdPassword: result.temporaryPassword
          })
        );
        return;
      }

      if (isRead && url.pathname === '/api/weather') {
        if (!ctx.user) {
          sendJson(res, 401, { error: 'Authentication required.' });
          return;
        }

        try {
          sendJson(res, 200, await getWeather(cfg));
        } catch (error) {
          sendJson(res, 502, { error: error.message });
        }
        return;
      }

      if (isRead && url.pathname === '/api/cubs') {
        if (!ctx.user) {
          sendJson(res, 401, { error: 'Authentication required.' });
          return;
        }

        try {
          sendJson(res, 200, await getCubs());
        } catch (error) {
          sendJson(res, 502, { error: error.message });
        }
        return;
      }

      if (isRead && url.pathname === '/api/news') {
        if (!ctx.user) {
          sendJson(res, 401, { error: 'Authentication required.' });
          return;
        }

        try {
          sendJson(res, 200, await getNews());
        } catch (error) {
          sendJson(res, 502, { error: error.message });
        }
        return;
      }

      if (isRead && url.pathname === '/api/spotify/now-playing') {
        if (!ctx.user) {
          sendJson(res, 401, { error: 'Authentication required.' });
          return;
        }

        try {
          sendJson(res, 200, await getSpotifyNowPlaying(cfg, ctx.user.integrations?.spotify));
        } catch (error) {
          sendJson(res, 502, { error: error.message });
        }
        return;
      }

      send(res, 404, notFoundPage(ctx));
    } catch (error) {
      console.error(error);
      send(res, 500, 'Something went wrong.');
    }
  });
}

async function main() {
  const store = new Store(config.dataDir, config.sessionDays);
  await store.init();

  const server = createApp({ cfg: config, store });
  server.listen(config.port, config.host, () => {
    console.log(`Nixon House listening on http://${config.host}:${config.port}`);
  });
}

const executedDirectly = process.argv[1] === fileURLToPath(import.meta.url);

if (executedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
