import { decryptSecret, encryptSecret } from './security.mjs';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
const API_URL = 'https://api.spotify.com/v1';

export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-currently-playing',
  'user-read-playback-state',
  'user-modify-playback-state'
];

export function spotifyConfigured(config) {
  return Boolean(config.spotify.clientId && config.spotify.clientSecret);
}

export function spotifyRedirectUri(config) {
  return config.spotify.redirectUri || new URL('/spotify/callback', config.publicUrl).toString();
}

function authHeader(config) {
  return `Basic ${Buffer.from(`${config.spotify.clientId}:${config.spotify.clientSecret}`).toString('base64')}`;
}

export function spotifyAuthorizeUrl(config, state) {
  const params = new URLSearchParams({
    client_id: config.spotify.clientId,
    response_type: 'code',
    redirect_uri: spotifyRedirectUri(config),
    scope: SPOTIFY_SCOPES.join(' '),
    state,
    show_dialog: 'false'
  });

  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeSpotifyCode(config, code) {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      authorization: authHeader(config),
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: spotifyRedirectUri(config)
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || `Spotify token exchange failed: ${response.status}`);
  }

  return payload;
}

export async function refreshSpotifyToken(config, encryptedRefreshToken) {
  const refreshToken = decryptSecret(encryptedRefreshToken, config.secret);
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      authorization: authHeader(config),
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || `Spotify refresh failed: ${response.status}`);
  }

  return payload.access_token;
}

async function spotifyGet(path, accessToken) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: 'application/json'
    }
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error?.message || `Spotify API request failed: ${response.status}`);
  }

  return payload;
}

export async function getSpotifyProfile(accessToken) {
  return spotifyGet('/me', accessToken);
}

export async function getSpotifyNowPlaying(config, connection) {
  if (!spotifyConfigured(config)) {
    return { configured: false, connected: Boolean(connection) };
  }

  if (!connection?.refreshToken) {
    return { configured: true, connected: false };
  }

  const accessToken = await refreshSpotifyToken(config, connection.refreshToken);
  const playback = await spotifyGet('/me/player/currently-playing?additional_types=track,episode', accessToken);

  if (!playback?.item) {
    return {
      configured: true,
      connected: true,
      isPlaying: false,
      empty: true,
      displayName: connection.displayName || 'Spotify'
    };
  }

  const item = playback.item;
  const artists = item.artists?.map((artist) => artist.name).join(', ') || item.show?.publisher || '';
  const image = item.album?.images?.[0]?.url || item.images?.[0]?.url || '';

  return {
    configured: true,
    connected: true,
    isPlaying: Boolean(playback.is_playing),
    type: playback.currently_playing_type,
    title: item.name,
    subtitle: artists,
    image,
    externalUrl: item.external_urls?.spotify || '',
    progressMs: playback.progress_ms || 0,
    durationMs: item.duration_ms || 0,
    displayName: connection.displayName || 'Spotify'
  };
}

export function spotifyConnectionFromTokenResponse(config, tokenPayload, profile) {
  return {
    connectedAt: new Date().toISOString(),
    displayName: profile?.display_name || profile?.id || 'Spotify',
    spotifyId: profile?.id || '',
    scopes: tokenPayload.scope || SPOTIFY_SCOPES.join(' '),
    refreshToken: encryptSecret(tokenPayload.refresh_token, config.secret)
  };
}
