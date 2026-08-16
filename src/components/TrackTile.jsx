export default function TrackTile({ track, onClick }) {
  return (
    <div onClick={onClick} className="flex-shrink-0 w-32 cursor-pointer">
      <div className="relative">
        <img src={track.coverUrl} alt="" className="w-32 h-32 rounded-lg object-cover mb-2 shadow-md" />
        {track.tier === "premium" && (
          <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-gradient-to-r from-wave-cyan to-wave-orange text-night rounded px-1.5 py-0.5">PREMIUM</span>
        )}
      </div>
      <p className="truncate text-sm font-medium text-ink">{track.title}</p>
      <p className="truncate text-xs text-muted">{track.artistName}</p>
    </div>
  );
}