import { NavLink, useNavigate } from 'react-router-dom';

const month = new Date().getMonth() + 1; // 1-12
const inFootballSeason = month >= 8 || month <= 1;

const NAV = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/links', label: 'Links', icon: '⊞' },
  { to: '/media', label: 'Media', icon: '▶' },
  { to: '/finance', label: 'Finance', icon: '$' },
  { to: '/cubs', label: 'Cubs', icon: '⚾' },
  ...(inFootballSeason ? [{ to: '/sports', label: 'Sports', icon: '🏈' }] : []),
  { to: '/news', label: 'News', icon: '◈' },
];

export default function BottomNav() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('nh_token');
    navigate('/login');
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-navy-light border-t border-white/10 flex items-center z-50">
      {NAV.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-condensed tracking-wide transition-colors ` +
            (isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200')
          }
        >
          <span className="text-lg leading-none">{icon}</span>
          <span className="uppercase text-[10px] tracking-widest">{label}</span>
        </NavLink>
      ))}
      <button
        onClick={logout}
        className="px-4 py-3 text-xs text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors"
        title="Logout"
      >
        ⏻
      </button>
    </nav>
  );
}
