import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function envNumber(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function envBoolean(name, fallback = false) {
  if (process.env[name] === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(process.env[name]).toLowerCase());
}

export const config = {
  appName: 'Nixon House',
  rootDir,
  publicDir: path.join(rootDir, 'public'),
  dataDir: process.env.NIXONHOUSE_DATA_DIR || path.join(rootDir, 'data'),
  host: process.env.HOST || '0.0.0.0',
  port: envNumber('PORT', 3000),
  publicUrl: process.env.PUBLIC_URL || 'https://nixonhouse.com',
  cookieSecure: envBoolean('COOKIE_SECURE', process.env.NODE_ENV === 'production'),
  sessionDays: envNumber('SESSION_DAYS', 7),
  secret: process.env.NIXONHOUSE_SECRET || 'dev-only-change-me',
  weather: {
    label: process.env.WEATHER_LABEL || 'Lakewood Ranch, FL',
    lat: envNumber('WEATHER_LAT', 27.459),
    lon: envNumber('WEATHER_LON', -82.4247),
    radarStation: process.env.RADAR_STATION || 'KTBW',
    radarUrl: process.env.RADAR_URL || 'https://radar.weather.gov/ridge/standard/KTBW_loop.gif'
  },
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
    redirectUri: process.env.SPOTIFY_REDIRECT_URI || ''
  }
};
