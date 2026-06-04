import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

function ScoreboardBox({ children, className = '' }) {
  return (
    <div className={`border-2 border-yellow-700/60 rounded px-4 py-3 bg-wrigley-green/80 font-mono ${className}`}>
      {children}
    </div>
  );
}

export default function Cubs() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    apiFetch('/api/cubs').then(setData).catch(() => setErr(true));
  }, []);

  if (err) return (
    <div className="max-w-2xl mx-auto px-4 pt-8">
      <h1 className="font-display text-5xl tracking-widest text-yellow-400 mb-4">CHICAGO CUBS</h1>
      <p className="text-slate-500 font-mono">Could not load Cubs data.</p>
    </div>
  );

  return (
    <div
      className="max-w-2xl mx-auto px-4 pt-8 pb-4"
      style={{ fontFamily: '"Barlow Condensed", sans-serif' }}
    >
      {/* Header — Wrigley scoreboard feel */}
      <div className="text-center mb-6">
        <div className="inline-block border-4 border-yellow-700 bg-wrigley-green rounded-xl px-8 py-4">
          <h1 className="font-display text-5xl tracking-[0.2em] text-yellow-300">CHICAGO CUBS</h1>
          <p className="text-yellow-600 font-mono text-xs tracking-widest mt-1">WRIGLEY FIELD · EST. 1914</p>
        </div>
      </div>

      {!data ? (
        <p className="text-slate-500 font-mono text-center animate-pulse">Loading from the ivy…</p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Record + Standing */}
          <div className="grid grid-cols-2 gap-3">
            <ScoreboardBox>
              <div className="text-yellow-600 text-xs uppercase tracking-widest mb-1">Record</div>
              <div className="text-yellow-200 text-3xl font-display tracking-widest">
                {data.record ? `${data.record.wins}–${data.record.losses}` : '–'}
              </div>
            </ScoreboardBox>
            <ScoreboardBox>
              <div className="text-yellow-600 text-xs uppercase tracking-widest mb-1">Standing</div>
              <div className="text-yellow-200 text-xl font-display">
                {data.standing ? `${data.standing.rank} · ${data.standing.gb} GB` : '–'}
              </div>
              <div className="text-yellow-600 text-xs font-mono mt-0.5">
                {data.standing?.division || 'NL Central'}
              </div>
            </ScoreboardBox>
          </div>

          {/* Magic Number */}
          {data.record?.magicNumber != null && (
            <ScoreboardBox className="text-center">
              <div className="text-yellow-600 text-xs uppercase tracking-widest mb-1">Magic Number</div>
              <div className="text-yellow-200 text-5xl font-display">{data.record.magicNumber}</div>
            </ScoreboardBox>
          )}

          {/* Recent Game */}
          {data.recentGame && (
            <ScoreboardBox>
              <div className="text-yellow-600 text-xs uppercase tracking-widest mb-2">
                {data.recentGame.status === 'Final' ? 'Last Game' : 'Today'}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-yellow-200 font-mono text-sm">
                  <div>{data.recentGame.away}</div>
                  <div>{data.recentGame.home}</div>
                </div>
                <div className="text-yellow-200 font-display text-4xl tracking-widest">
                  <div>{data.recentGame.awayScore ?? '–'}</div>
                  <div>{data.recentGame.homeScore ?? '–'}</div>
                </div>
              </div>
              {data.recentGame.cubsWin !== undefined && (
                <div className={`text-xs font-mono mt-2 ${data.recentGame.cubsWin ? 'text-green-400' : 'text-red-400'}`}>
                  {data.recentGame.cubsWin ? '▲ W' : '▼ L'}
                </div>
              )}
            </ScoreboardBox>
          )}

          {/* Headlines */}
          {data.headlines?.length > 0 && (
            <div>
              <div className="text-yellow-700 text-xs uppercase tracking-widest mb-2 font-mono">Headlines</div>
              <div className="flex flex-col gap-2">
                {data.headlines.map((h, i) => (
                  <a
                    key={i}
                    href={h.link}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-wrigley-green/60 border border-yellow-700/30 rounded px-3 py-2 text-yellow-200 text-sm font-condensed hover:border-yellow-500/60 transition-colors"
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
