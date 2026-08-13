export default function TrackTile({ track, onClick }) {
  return (
    <div onClick={onClick} className="flex-shrink-0 w-32 cursor-pointer">
      <img src={track.coverUrl} alt="" className="w-32 h-32 rounded-lg object-cover mb-2 shadow-md" />
      <p className="truncate text-sm font-medium text-ink">{track.title}</p>
      <p className="truncate text-xs text-muted">{track.artistName}</p>
    </div>
  );
}