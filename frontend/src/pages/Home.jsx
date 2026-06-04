import WeatherWidget from '../components/WeatherWidget';
import LinkTile from '../components/LinkTile';
import links from '../data/links.json';

const quickLinks = links.filter(l => l.quick);

export default function Home() {
  function handleSearch(e) {
    e.preventDefault();
    const q = e.target.q.value.trim();
    if (q) window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
      <h1 className="font-display text-4xl tracking-widest text-white mb-6 text-center">NIXONHOUSE</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            name="q"
            type="search"
            placeholder="Search the web…"
            className="flex-1 bg-navy-card border border-white/10 focus:border-amber-400/60 rounded-xl px-5 py-4 font-mono text-sm text-white placeholder-slate-600 outline-none transition-colors"
            autoFocus
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-navy font-display text-lg tracking-widest px-6 rounded-xl transition-colors"
          >
            GO
          </button>
        </div>
      </form>

      {/* Weather */}
      <div className="mb-8">
        <h2 className="font-condensed text-xs uppercase tracking-widest text-slate-500 mb-2">
          Lakewood Ranch, FL
        </h2>
        <WeatherWidget />
      </div>

      {/* Quick Links */}
      {quickLinks.length > 0 && (
        <div>
          <h2 className="font-condensed text-xs uppercase tracking-widest text-slate-500 mb-3">Quick Access</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickLinks.map(l => <LinkTile key={l.name} {...l} />)}
          </div>
        </div>
      )}
    </div>
  );
}
