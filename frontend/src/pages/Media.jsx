import LinkTile from '../components/LinkTile';

const JELLYFIN_URL = import.meta.env.VITE_JELLYFIN_URL || 'http://localhost:8096';

const mediaLinks = [
  { name: 'Jellyfin', url: JELLYFIN_URL, icon: '🎬', description: 'Media Server' },
  { name: 'Sonarr', url: import.meta.env.VITE_SONARR_URL || '#', icon: '📺', description: 'TV Shows' },
  { name: 'Radarr', url: import.meta.env.VITE_RADARR_URL || '#', icon: '🎞', description: 'Movies' },
  { name: 'qBittorrent', url: import.meta.env.VITE_QBITTORRENT_URL || '#', icon: '⬇', description: 'Downloads' },
  { name: 'Real-Debrid', url: 'https://real-debrid.com', icon: '⚡', description: 'Debrid Service' },
];

export default function Media() {
  function handleSearch(e) {
    e.preventDefault();
    const q = e.target.q.value.trim();
    if (q) window.open(`${JELLYFIN_URL}/web/index.html#!/search.html?query=${encodeURIComponent(q)}`, '_blank');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
      <h1 className="font-display text-4xl tracking-widest text-white mb-6">MEDIA</h1>

      {/* Jellyfin search */}
      <div className="mb-8">
        <h2 className="font-condensed text-xs uppercase tracking-widest text-slate-500 mb-2">Search Jellyfin</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            name="q"
            type="search"
            placeholder="Search movies, shows…"
            className="flex-1 bg-navy-card border border-white/10 focus:border-amber-400/60 rounded-xl px-5 py-4 font-mono text-sm text-white placeholder-slate-600 outline-none transition-colors"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-navy font-display text-lg tracking-widest px-6 rounded-xl transition-colors"
          >
            FIND
          </button>
        </form>
      </div>

      {/* Service tiles */}
      <div>
        <h2 className="font-condensed text-xs uppercase tracking-widest text-slate-500 mb-3">Services</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {mediaLinks.map(l => <LinkTile key={l.name} {...l} />)}
        </div>
      </div>
    </div>
  );
}
