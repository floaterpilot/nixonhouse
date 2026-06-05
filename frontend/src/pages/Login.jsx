import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('nh_token', data.token);
      navigate('/');
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy px-4">
      <div className="mb-8 text-center">
        <h1 className="font-display text-6xl tracking-widest text-white">NIXONHOUSE</h1>
        <p className="text-slate-500 font-mono text-sm mt-1">private dashboard</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input
          type="text"
          placeholder="username"
          value={user}
          onChange={e => setUser(e.target.value)}
          required
          autoFocus
          className="bg-navy-card border border-white/10 focus:border-amber-400/60 rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-slate-600 outline-none transition-colors"
        />
        <input
          type="password"
          placeholder="password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          required
          className="bg-navy-card border border-white/10 focus:border-amber-400/60 rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-slate-600 outline-none transition-colors"
        />
        {err && <p className="text-red-400 text-sm font-mono text-center">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-navy font-display text-xl tracking-widest rounded-lg py-3 transition-colors"
        >
          {loading ? 'AUTHENTICATING…' : 'ENTER'}
        </button>
      </form>
    </div>
  );
}
