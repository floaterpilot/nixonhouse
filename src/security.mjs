import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

export function randomId(prefix = 'id') {
  return `${prefix}_${crypto.randomBytes(12).toString('base64url')}`;
}

export function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

export function isValidUsername(username) {
  return /^[a-z0-9][a-z0-9._-]{1,30}[a-z0-9]$/.test(username);
}

export function generateTempPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const chunks = Array.from({ length: 4 }, () => {
    let chunk = '';
    while (chunk.length < 4) {
      chunk += alphabet[crypto.randomInt(alphabet.length)];
    }
    return chunk;
  });

  return `NH-${chunks.join('-')}`;
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);

  return {
    algorithm: 'scrypt',
    keyLength: KEY_LENGTH,
    salt,
    hash: derivedKey.toString('base64url')
  };
}

export async function verifyPassword(password, stored) {
  if (!stored || stored.algorithm !== 'scrypt' || !stored.salt || !stored.hash) {
    return false;
  }

  const derivedKey = await scryptAsync(password, stored.salt, stored.keyLength || KEY_LENGTH);
  const expected = Buffer.from(stored.hash, 'base64url');

  if (expected.length !== derivedKey.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, derivedKey);
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('base64url');
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function createCsrfToken() {
  return crypto.randomBytes(24).toString('base64url');
}

function encryptionKey(secret) {
  return crypto.createHash('sha256').update(String(secret)).digest();
}

export function encryptSecret(value, secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);

  return {
    algorithm: 'aes-256-gcm',
    iv: iv.toString('base64url'),
    tag: cipher.getAuthTag().toString('base64url'),
    value: encrypted.toString('base64url')
  };
}

export function decryptSecret(payload, secret) {
  if (!payload || payload.algorithm !== 'aes-256-gcm') return '';

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    encryptionKey(secret),
    Buffer.from(payload.iv, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64url'));

  return Buffer.concat([
    decipher.update(Buffer.from(payload.value, 'base64url')),
    decipher.final()
  ]).toString('utf8');
}
