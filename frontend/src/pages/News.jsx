import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import WeatherWidget from '../components/WeatherWidget';

function NewsCard({ item }) {
  const date = item.pubDate ? new Date(item.pubDate).toLocaleDateString('en', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  }) : '';

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noreferrer"
      className="block bg-navy-card border border-white/5 hover:border-amber-400/30 rounded-xl px-4 py-3 transition-all group"
    >
      <div className="font-condensed font-semibold text-white group-hover:text-amber-400 transition-colors mb-1">
        {item.title}
      </div>
      {item.summary && (
        <div className="text-slate-500 text-xs font-mono leading-relaxed line-clamp-2">{item.summary}</div>
      )}
      {date && <div className="text-slate-600 text-xs font-mono mt-1">{date}</div>}
    </a>
  );
}

export default function News() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    apiFetch('/api/news').then(setData).catch(() => setErr(true));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
      <h1 className="font-display text-4xl tracking-widest text-white mb-6">NEWS</h1>

      {/* 5-day forecast */}
      <div className="mb-8">
        <h2 className="font-condensed text-xs uppercase tracking-widest text-slate-500 mb-2">5-Day Forecast · LWR</h2>
        <WeatherWidget />
      </div>

      {err ? (
        <p className="text-slate-500 font-mono">Could not load news.</p>
      ) : !data ? (
        <p className="text-slate-500 font-mono animate-pulse">Loading…</p>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="font-condensed text-xs uppercase tracking-widest text-slate-500 mb-3 border-b border-white/5 pb-2">
              Top Headlines
            </h2>
            <div className="flex flex-col gap-2">
              {data.topNews.map((item, i) => <NewsCard key={i} item={item} />)}
            </div>
          </div>
          <div>
            <h2 className="font-condensed text-xs uppercase tracking-widest text-slate-500 mb-3 border-b border-white/5 pb-2">
              Tech & AI
            </h2>
            <div className="flex flex-col gap-2">
              {data.tech.map((item, i) => <NewsCard key={i} item={item} />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
