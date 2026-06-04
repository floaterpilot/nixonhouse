export default function LinkTile({ name, url, icon, description }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col items-center gap-2 bg-navy-card hover:bg-white/10 border border-white/5 hover:border-amber-400/30 rounded-xl p-4 transition-all group"
    >
      <span className="text-3xl">{icon}</span>
      <span className="font-condensed font-semibold text-sm text-white group-hover:text-amber-400 tracking-wide text-center transition-colors">
        {name}
      </span>
      {description && (
        <span className="text-xs text-slate-500 text-center">{description}</span>
      )}
    </a>
  );
}
