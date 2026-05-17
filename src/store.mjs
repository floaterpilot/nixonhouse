import fs from 'node:fs/promises';
import path from 'node:path';

import {
  createCsrfToken,
  createSessionToken,
  generateTempPassword,
  hashPassword,
  hashToken,
  isValidUsername,
  normalizeUsername,
  randomId,
  verifyPassword
} from './security.mjs';

function nowIso() {
  return new Date().toISOString();
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export class Store {
  constructor(dataDir, sessionDays = 7) {
    this.dataDir = dataDir;
    this.usersFile = path.join(dataDir, 'users.json');
    this.sessionsFile = path.join(dataDir, 'sessions.json');
    this.sessionMs = sessionDays * 24 * 60 * 60 * 1000;
  }

  async init() {
    await fs.mkdir(this.dataDir, { recursive: true });

    if (!(await pathExists(this.usersFile))) {
      await this.writeJson(this.usersFile, { users: [] });
    }

    if (!(await pathExists(this.sessionsFile))) {
      await this.writeJson(this.sessionsFile, { sessions: [] });
    }

    await this.pruneSessions();
  }

  async readJson(filePath, fallback) {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      return JSON.parse(raw);
    } catch (error) {
      if (error.code === 'ENOENT') return fallback;
      throw error;
    }
  }

  async writeJson(filePath, data) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmpPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    await fs.rename(tmpPath, filePath);
  }

  async getUsers() {
    const data = await this.readJson(this.usersFile, { users: [] });
    return data.users || [];
  }

  async saveUsers(users) {
    await this.writeJson(this.usersFile, { users });
  }

  async getSessions() {
    const data = await this.readJson(this.sessionsFile, { sessions: [] });
    return data.sessions || [];
  }

  async saveSessions(sessions) {
    await this.writeJson(this.sessionsFile, { sessions });
  }

  async findUserByUsername(username) {
    const normalized = normalizeUsername(username);
    const users = await this.getUsers();
    return users.find((user) => user.username === normalized) || null;
  }

  async findUserById(id) {
    const users = await this.getUsers();
    return users.find((user) => user.id === id) || null;
  }

  async createUser({ username, displayName, role = 'user', password, mustChangePassword = true }) {
    const normalized = normalizeUsername(username);

    if (!isValidUsername(normalized)) {
      throw new Error('Usernames must be 3-32 characters using letters, numbers, dots, dashes, or underscores.');
    }

    const users = await this.getUsers();
    if (users.some((user) => user.username === normalized)) {
      throw new Error(`The username "${normalized}" already exists.`);
    }

    const passwordToStore = password || generateTempPassword();
    const timestamp = nowIso();
    const user = {
      id: randomId('usr'),
      username: normalized,
      displayName: String(displayName || normalized).trim(),
      role: role === 'admin' ? 'admin' : 'user',
      passwordHash: await hashPassword(passwordToStore),
      mustChangePassword: Boolean(mustChangePassword),
      disabled: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastLoginAt: null
    };

    users.push(user);
    await this.saveUsers(users);

    return { user, temporaryPassword: passwordToStore };
  }

  async updateUser(userId, updates) {
    const users = await this.getUsers();
    const index = users.findIndex((user) => user.id === userId);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: nowIso()
    };

    await this.saveUsers(users);
    return users[index];
  }

  async updateUserIntegrations(userId, integrationUpdates) {
    const user = await this.findUserById(userId);
    if (!user) return null;

    return this.updateUser(userId, {
      integrations: {
        ...(user.integrations || {}),
        ...integrationUpdates
      }
    });
  }

  async setPassword(userId, password, mustChangePassword = false) {
    return this.updateUser(userId, {
      passwordHash: await hashPassword(password),
      mustChangePassword
    });
  }

  async resetPassword(userId) {
    const temporaryPassword = generateTempPassword();
    const user = await this.setPassword(userId, temporaryPassword, true);
    return { user, temporaryPassword };
  }

  async authenticate(username, password) {
    const user = await this.findUserByUsername(username);
    if (!user || user.disabled) return null;

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return null;

    await this.updateUser(user.id, { lastLoginAt: nowIso() });
    return this.findUserById(user.id);
  }

  async createSession(userId) {
    const token = createSessionToken();
    const timestamp = Date.now();
    const sessions = await this.getSessions();

    sessions.push({
      id: randomId('ses'),
      userId,
      tokenHash: hashToken(token),
      csrfToken: createCsrfToken(),
      createdAt: new Date(timestamp).toISOString(),
      expiresAt: new Date(timestamp + this.sessionMs).toISOString()
    });

    await this.saveSessions(sessions);
    return token;
  }

  async getSession(token) {
    if (!token) return null;

    const sessions = await this.getSessions();
    const tokenHash = hashToken(token);
    const session = sessions.find((item) => item.tokenHash === tokenHash);

    if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    const user = await this.findUserById(session.userId);
    if (!user || user.disabled) {
      return null;
    }

    return { session, user };
  }

  async updateSession(token, updates) {
    if (!token) return null;

    const tokenHash = hashToken(token);
    const sessions = await this.getSessions();
    const index = sessions.findIndex((session) => session.tokenHash === tokenHash);

    if (index === -1) return null;

    sessions[index] = {
      ...sessions[index],
      ...updates
    };

    await this.saveSessions(sessions);
    return sessions[index];
  }

  async setSessionOAuthState(token, provider, state) {
    const sessionData = await this.getSession(token);
    if (!sessionData) return null;

    return this.updateSession(token, {
      oauth: {
        ...(sessionData.session.oauth || {}),
        [provider]: state
      }
    });
  }

  async consumeSessionOAuthState(token, provider, state) {
    const sessionData = await this.getSession(token);
    const expected = sessionData?.session.oauth?.[provider];

    if (!expected || expected !== state) return false;

    const oauth = { ...(sessionData.session.oauth || {}) };
    delete oauth[provider];
    await this.updateSession(token, { oauth });

    return true;
  }

  async destroySession(token) {
    if (!token) return;
    const tokenHash = hashToken(token);
    const sessions = await this.getSessions();
    await this.saveSessions(sessions.filter((session) => session.tokenHash !== tokenHash));
  }

  async pruneSessions() {
    const sessions = await this.getSessions();
    const now = Date.now();
    const activeSessions = sessions.filter((session) => new Date(session.expiresAt).getTime() > now);

    if (activeSessions.length !== sessions.length) {
      await this.saveSessions(activeSessions);
    }
  }
}
