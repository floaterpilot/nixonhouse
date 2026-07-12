const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('nh_token');
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('nh_token');
    window.location.href = '/login';
  }
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export function apiFetch(path) {
  return request(path);
}

export function apiPost(path, body) {
  return request(path, { method: 'POST', body });
}

export function apiPatch(path, body) {
  return request(path, { method: 'PATCH', body });
}
