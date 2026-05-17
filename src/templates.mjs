import { cubsLinks, dashboardSections, newsLinks } from './content.mjs';

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function linkList(links) {
  return links
    .map(
      (link) => `
        <a class="quick-link" href="${escapeHtml(link.href)}" target="${link.href.startsWith('http') ? '_blank' : '_self'}" rel="noreferrer">
          <span>${escapeHtml(link.label)}</span>
          ${link.note ? `<small>${escapeHtml(link.note)}</small>` : ''}
        </a>
      `
    )
    .join('');
}

function csrfInput(ctx) {
  return ctx.csrfToken ? `<input type="hidden" name="csrf" value="${escapeHtml(ctx.csrfToken)}">` : '';
}

function nav(ctx, active = '') {
  const user = ctx.user;

  return `
    <header class="site-header ${user ? '' : 'public-header'}">
      <a class="brand" href="/" aria-label="Nixon House home">
        <span class="brand-mark">NH</span>
        <span>Nixon House</span>
      </a>
      ${
        user
          ? `<nav class="nav-links" aria-label="Primary navigation">
              <a href="/" ${active === 'home' ? 'aria-current="page"' : ''}>Home</a>
              <a href="/dashboard" ${active === 'dashboard' ? 'aria-current="page"' : ''}>Dashboard</a>
              ${
                user.role === 'admin'
                  ? `<a href="/admin" ${active === 'admin' ? 'aria-current="page"' : ''}>Admin</a>`
                  : ''
              }
            </nav>
            <div class="header-actions">
              <span class="user-chip">${escapeHtml(user.displayName || user.username)}</span>
              <form method="post" action="/logout" class="inline-form">
                ${csrfInput(ctx)}
                <button class="button ghost" type="submit">Sign out</button>
              </form>
            </div>`
          : ''
      }
    </header>
  `;
}

export function layout({ title, ctx = {}, active = '', content, bodyClass = '' }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#11221f">
    <title>${escapeHtml(title)} | Nixon House</title>
    <link rel="stylesheet" href="/styles.css">
    <script defer src="/app.js"></script>
  </head>
  <body class="${escapeHtml(bodyClass)}">
    ${nav(ctx, active)}
    ${content}
  </body>
</html>`;
}

export function landingPage(ctx) {
  return layout({
    title: 'Home',
    ctx,
    active: 'home',
    bodyClass: 'landing',
    content: `
      <main>
        <section class="hero">
          <div class="hero-media" aria-hidden="true"></div>
          <div class="hero-content">
            <p class="eyebrow">Private homelab launchpad</p>
            <h1>Nixon House</h1>
            <p class="hero-copy">
              A simple front door for weather, Cubs links, news, media tools, documents, music, and the house systems that keep everything moving.
            </p>
            ${
              ctx.user
                ? `<div class="hero-actions">
                    <a class="button primary" href="/dashboard">Open dashboard</a>
                  </div>`
                : `<form id="sign-in" method="post" action="/login" class="hero-signin" aria-label="Sign in">
                    <label>
                      Username
                      <input name="username" autocomplete="username" required>
                    </label>
                    <label>
                      Password
                      <input name="password" type="password" autocomplete="current-password" required>
                    </label>
                    <button class="button primary" type="submit">Sign in</button>
                  </form>`
            }
          </div>
        </section>
      </main>
    `
  });
}

export function loginPage(ctx, message = '') {
  return layout({
    title: 'Sign in',
    ctx,
    content: `
      <main class="auth-shell">
        <section class="auth-panel">
          <p class="eyebrow">Private access</p>
          <h1>Sign in to Nixon House</h1>
          ${message ? `<div class="notice error">${escapeHtml(message)}</div>` : ''}
          <form method="post" action="/login" class="form-stack">
            <label>
              Username
              <input name="username" autocomplete="username" required autofocus>
            </label>
            <label>
              Password
              <input name="password" type="password" autocomplete="current-password" required>
            </label>
            <button class="button primary full" type="submit">Sign in</button>
          </form>
        </section>
      </main>
    `
  });
}

export function changePasswordPage(ctx, message = '', isError = false) {
  return layout({
    title: 'Change password',
    ctx,
    content: `
      <main class="auth-shell">
        <section class="auth-panel">
          <p class="eyebrow">Password required</p>
          <h1>Create your permanent password</h1>
          <p class="muted">Temporary passwords can only be used to get you here.</p>
          ${message ? `<div class="notice ${isError ? 'error' : 'success'}">${escapeHtml(message)}</div>` : ''}
          <form method="post" action="/change-password" class="form-stack">
            ${csrfInput(ctx)}
            <label>
              Current password
              <input name="currentPassword" type="password" autocomplete="current-password" required>
            </label>
            <label>
              New password
              <input name="newPassword" type="password" autocomplete="new-password" minlength="12" required>
            </label>
            <label>
              Confirm new password
              <input name="confirmPassword" type="password" autocomplete="new-password" minlength="12" required>
            </label>
            <button class="button primary full" type="submit">Save password</button>
          </form>
        </section>
      </main>
    `
  });
}

function spotifyPanel(ctx) {
  const spotifyConnected = Boolean(ctx.user.integrations?.spotify);

  return `
    <article id="spotify" class="media-spotify" data-spotify-panel data-spotify-configured="${ctx.spotifyConfigured ? 'true' : 'false'}">
      <div class="panel-heading">
        <p class="eyebrow">Spotify</p>
        <span data-spotify-status>${spotifyConnected ? 'Connected' : 'Personal'}</span>
      </div>
      <div class="spotify-body" data-spotify-body>
        <div class="spotify-art" data-spotify-art aria-hidden="true">SP</div>
        <div>
          <h3 data-spotify-title>${spotifyConnected ? 'Loading Spotify' : 'Connect Spotify'}</h3>
          <p data-spotify-subtitle>${spotifyConnected ? 'Checking current playback...' : 'Not connected'}</p>
        </div>
      </div>
      <div class="spotify-actions">
        ${
          spotifyConnected
            ? `<a class="button small primary" data-spotify-open href="https://open.spotify.com/" target="_blank" rel="noreferrer">Open</a>
              <form method="post" action="/spotify/disconnect" class="inline-form">
                ${csrfInput(ctx)}
                <button class="button small ghost" type="submit">Disconnect</button>
              </form>`
            : ctx.spotifyConfigured
              ? `<a class="button small primary" href="/spotify/connect">Connect</a>`
              : `<span class="button small ghost disabled">Setup needed</span>`
        }
      </div>
    </article>
  `;
}

function dashboardSection(section, ctx) {
  const isMedia = section.title === 'Media';

  return `
    <section class="dashboard-card action-card ${isMedia ? 'media-card' : ''}">
      <div>
        <h2>${escapeHtml(section.title)}</h2>
        <p>${escapeHtml(section.description)}</p>
      </div>
      <div class="quick-grid">
        ${linkList(section.links)}
      </div>
      ${isMedia ? spotifyPanel(ctx) : ''}
    </section>
  `;
}

export function dashboardPage(ctx) {
  const sections = dashboardSections.map((section) => dashboardSection(section, ctx)).join('');

  return layout({
    title: 'Dashboard',
    ctx,
    active: 'dashboard',
    bodyClass: 'app-body',
    content: `
      <main class="dashboard-shell">
        <section class="dashboard-hero soft-hero">
          <div>
            <p class="eyebrow">Signed in as ${escapeHtml(ctx.user.displayName || ctx.user.username)}</p>
            <h1>House dashboard</h1>
          </div>
          <div class="status-pill">Private</div>
        </section>

        <section class="dashboard-stack">
          <a class="dashboard-card weather-summary-card" href="/weather" data-weather-panel>
            <div class="panel-heading">
              <p class="eyebrow">Weather</p>
              <span data-weather-label>Lakewood Ranch</span>
            </div>
            <div class="weather-summary-layout">
              <div>
                <div class="weather-reading" data-weather-reading>--</div>
                <p class="weather-detail" data-weather-detail>Checking the forecast...</p>
              </div>
              <div class="weather-metrics">
                <div>
                  <span>Feels like</span>
                  <strong data-weather-feels>--</strong>
                </div>
                <div>
                  <span>Precip</span>
                  <strong data-weather-precip>--</strong>
                </div>
                <div>
                  <span>Wind</span>
                  <strong data-weather-wind>--</strong>
                </div>
              </div>
            </div>
          </a>

          <section class="dashboard-card cubs-card">
            <div class="panel-heading">
              <div>
                <p class="eyebrow">Cubs</p>
                <h2>Game strip</h2>
              </div>
              <a class="latest-video-link" data-cubs-video href="https://www.youtube.com/c/LockedOnCubs" target="_blank" rel="noreferrer">Locked On Cubs</a>
            </div>
            <div class="quick-grid cubs-links">
              ${linkList(cubsLinks)}
            </div>
            <div class="game-strip" data-cubs-games>
              <div class="game-tile placeholder">Loading Cubs schedule...</div>
            </div>
          </section>

          <section class="dashboard-card news-card">
            <div class="panel-heading">
              <div>
                <p class="eyebrow">News</p>
                <h2>Tech feed</h2>
              </div>
              <span data-news-source>The Verge</span>
            </div>
            <div class="quick-grid news-links">
              ${linkList(newsLinks)}
            </div>
            <div class="news-feed" data-news-feed>
              <div class="news-feed-item placeholder">Loading tech headlines...</div>
            </div>
          </section>
        </section>

        <div class="dashboard-grid">
          ${sections}
        </div>
      </main>
    `
  });
}

export function weatherPage(ctx) {
  return layout({
    title: 'Weather',
    ctx,
    active: 'dashboard',
    bodyClass: 'app-body',
    content: `
      <main class="dashboard-shell weather-page">
        <section class="dashboard-hero soft-hero">
          <div>
            <p class="eyebrow">Lakewood Ranch</p>
            <h1>Weather</h1>
          </div>
          <a class="button ghost" href="/dashboard">Dashboard</a>
        </section>

        <section class="weather-detail-grid">
          <article class="weather-panel detail-weather" data-weather-panel>
            <div class="panel-heading">
              <p class="eyebrow">Now</p>
              <span data-weather-label>Loading</span>
            </div>
            <div class="weather-reading" data-weather-reading>--</div>
            <p class="weather-detail" data-weather-detail>Checking the forecast...</p>
            <div class="weather-metrics">
              <div>
                <span>Feels like</span>
                <strong data-weather-feels>--</strong>
              </div>
              <div>
                <span>Precip</span>
                <strong data-weather-precip>--</strong>
              </div>
              <div>
                <span>Wind</span>
                <strong data-weather-wind>--</strong>
              </div>
            </div>
          </article>
          <article class="dashboard-card hourly-card">
            <div class="panel-heading">
              <p class="eyebrow">Hourly</p>
              <span>Next 12</span>
            </div>
            <div class="hourly-list" data-hourly-list>
              <span>Loading forecast...</span>
            </div>
          </article>
        </section>

        <article class="dashboard-card radar-card">
          <div class="panel-heading">
            <p class="eyebrow">Radar</p>
            <a href="#" data-radar-link target="_blank" rel="noreferrer">Open</a>
          </div>
          <img data-radar-image alt="Local weather radar loop">
        </article>
      </main>
    `
  });
}

export function adminPage(ctx, { users = [], notice = '', error = '', createdPassword = '' } = {}) {
  const rows = users
    .map(
      (user) => `
        <tr>
          <td>
            <strong>${escapeHtml(user.displayName || user.username)}</strong>
            <span>${escapeHtml(user.username)}</span>
          </td>
          <td>${escapeHtml(user.role)}</td>
          <td>${user.mustChangePassword ? '<span class="badge warn">Must change</span>' : '<span class="badge">Set</span>'}</td>
          <td>${user.lastLoginAt ? escapeHtml(new Date(user.lastLoginAt).toLocaleString()) : 'Never'}</td>
          <td>
            <form method="post" action="/admin/users/${escapeHtml(user.id)}/reset" class="inline-form">
              ${csrfInput(ctx)}
              <button class="button small ghost" type="submit">Reset</button>
            </form>
          </td>
        </tr>
      `
    )
    .join('');

  return layout({
    title: 'Admin',
    ctx,
    active: 'admin',
    bodyClass: 'app-body',
    content: `
      <main class="admin-shell">
        <section class="dashboard-hero">
          <div>
            <p class="eyebrow">Admin</p>
            <h1>User access</h1>
          </div>
        </section>

        ${notice ? `<div class="notice success">${escapeHtml(notice)}</div>` : ''}
        ${error ? `<div class="notice error">${escapeHtml(error)}</div>` : ''}
        ${
          createdPassword
            ? `<div class="temp-password">
                <span>Temporary password</span>
                <code>${escapeHtml(createdPassword)}</code>
              </div>`
            : ''
        }

        <section class="admin-grid">
          <article class="dashboard-card">
            <h2>Add user</h2>
            <form method="post" action="/admin/users" class="form-stack">
              ${csrfInput(ctx)}
              <label>
                Username
                <input name="username" placeholder="first.last" autocomplete="off" required>
              </label>
              <label>
                Display name
                <input name="displayName" placeholder="First Last" autocomplete="off">
              </label>
              <label>
                Role
                <select name="role">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <button class="button primary full" type="submit">Create user</button>
            </form>
          </article>

          <article class="dashboard-card users-card">
            <h2>Users</h2>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Password</th>
                    <th>Last login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows || '<tr><td colspan="5">No users yet.</td></tr>'}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </main>
    `
  });
}

export function notFoundPage(ctx) {
  return layout({
    title: 'Not found',
    ctx,
    content: `
      <main class="auth-shell">
        <section class="auth-panel">
          <p class="eyebrow">404</p>
          <h1>That page is not here.</h1>
          <a class="button primary full" href="/">Go home</a>
        </section>
      </main>
    `
  });
}
