import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

const WMO_ICON = {
  0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️',
  45: '🌫', 48: '🌫', 51: '🌦', 53: '🌦', 55: '🌧',
  61: '🌧', 63: '🌧', 65: '🌧', 71: '🌨', 73: '❄️', 75: '❄️',
  80: '🌦', 81: '🌧', 82: '⛈', 95: '⛈', 96: '⛈', 99: '⛈'
};

export default function WeatherWidget() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    apiFetch('/api/weather').then(setData).catch(() => setErr(true));
  }, []);

  if (err) return <div className="text-slate-500 text-sm">Weather unavailable</div>;
  if (!data) return <div className="text-slate-500 text-sm animate-pulse">Loading weather…</div>;

  const { current, daily } = data;
  const today = daily[0];

  return (
    <div className="bg-navy-card rounded-xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-5xl font-display text-white">{current.temp}°</span>
          <span className="text-slate-400 font-condensed ml-2 text-lg">{current.condition}</span>
        </div>
        <span className="text-4xl">{WMO_ICON[current.code] || '🌡'}</span>
      </div>
      <div className="text-slate-400 text-sm font-mono mb-4">
        H:{today.high}° · L:{today.low}° · Humidity: {current.humidity}%
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {daily.slice(1).map((d) => (
          <div key={d.date} className="flex-shrink-0 flex flex-col items-center bg-white/5 rounded-lg px-3 py-2 min-w-[60px]">
            <span className="text-xs text-slate-400 font-mono">
              {new Date(d.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' })}
            </span>
            <span className="text-lg my-1">{WMO_ICON[d.code] || '🌡'}</span>
            <span className="text-xs font-mono text-white">{d.high}°</span>
            <span className="text-xs font-mono text-slate-500">{d.low}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
