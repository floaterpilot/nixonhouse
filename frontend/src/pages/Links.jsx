import LinkTile from '../components/LinkTile';
import links from '../data/links.json';

const categories = [...new Set(links.map(l => l.category))];

export default function Links() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
      <h1 className="font-display text-4xl tracking-widest text-white mb-6">LINKS</h1>
      {categories.map(cat => {
        const items = links.filter(l => l.category === cat);
        return (
          <div key={cat} className="mb-8">
            <h2 className="font-condensed text-xs uppercase tracking-widest text-slate-500 mb-3 border-b border-white/5 pb-2">
              {cat}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {items.map(l => <LinkTile key={l.name} {...l} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
