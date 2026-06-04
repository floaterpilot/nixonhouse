const BASE = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path) {
  const token = localStorage.getItem('nh_token');
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('nh_token');
    window.location.href = '/login';
  }
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
