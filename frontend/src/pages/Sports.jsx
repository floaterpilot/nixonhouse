import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

const month = new Date().getMonth() + 1;
const inSeason = month >= 8 || month <= 1;

export default function Sports() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!inSeason) return;
    apiFetch('/api/sports/tennessee').then(setData).catch(() => setErr(true));
  }, []);

  if (!inSeason) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-8 text-center">
        <div className="text-6xl mb-4">🏈</div>
        <h1 className="font-display text-4xl tracking-widest text-orange-400 mb-2">TENNESSEE VOLS</h1>
        <p className="text-slate-500 font-mono">Football season returns in August.</p>
        <p className="text-slate-600 font-mono text-sm mt-1">GBO</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-4">
      <div className="text-center mb-6">
        <div className="inline-block border-4 border-orange-600 bg-orange-950/60 rounded-xl px-8 py-4">
          <h1 className="font-display text-5xl tracking-[0.2em] text-orange-400">TENNESSEE</h1>
          <p className="text-orange-700 font-mono text-xs tracking-widest mt-1">VOLUNTEERS · KNOXVILLE</p>
        </div>
      </div>

      {err ? (
        <p className="text-slate-500 font-mono text-center">Could not load Tennessee data.</p>
      ) : !data ? (
        <p className="text-slate-500 font-mono text-center animate-pulse">Loading…</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-navy-card border border-orange-600/30 rounded-xl px-4 py-3">
              <div className="text-orange-600 text-xs uppercase tracking-widest mb-1 font-mono">Record</div>
              <div className="text-orange-300 text-3xl font-display tracking-widest">
                {data.team?.record || '–'}
              </div>
            </div>
            <div className="bg-navy-card border border-orange-600/30 rounded-xl px-4 py-3">
              <div className="text-orange-600 text-xs uppercase tracking-widest mb-1 font-mono">Ranking</div>
              <div className="text-orange-300 text-3xl font-display tracking-widest">
                {data.team?.ranking ? `#${data.team.ranking}` : 'NR'}
              </div>
            </div>
          </div>

          {data.team?.nextEvent && (
            <div className="bg-navy-card border border-orange-600/30 rounded-xl px-4 py-3">
              <div className="text-orange-600 text-xs uppercase tracking-widest mb-2 font-mono">Next Game</div>
              <div className="text-white font-condensed text-lg">vs. {data.team.nextEvent.opponent}</div>
              <div className="text-slate-400 font-mono text-sm">
                {data.team.nextEvent.date ? new Date(data.team.nextEvent.date).toLocaleString('en', {
                  weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                }) : ''}
              </div>
              {data.team.nextEvent.venue && (
                <div className="text-slate-500 font-mono text-xs mt-0.5">{data.team.nextEvent.venue}</div>
              )}
            </div>
          )}

          {data.headlines?.length > 0 && (
            <div>
              <div className="text-orange-700 text-xs uppercase tracking-widest mb-2 font-mono">Headlines</div>
              <div className="flex flex-col gap-2">
                {data.headlines.map((h, i) => (
                  <a
                    key={i}
                    href={h.link}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-navy-card border border-orange-600/20 rounded-lg px-3 py-2 text-slate-200 text-sm font-condensed hover:border-orange-500/40 transition-colors"
                  >
                    {h.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
