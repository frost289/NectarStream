import { X, ChevronUp, ChevronDown } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

export default function QueueSheet({ onClose }) {
  const { queue, currentTrack, moveInQueue, removeFromQueue, playTrack } = usePlayer();

  return (
    <div className="fixed inset-0 bg-night/70 z-[60] flex items-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-panel w-full max-h-[70vh] rounded-t-2xl flex flex-col border-t border-line">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h3 className="font-semibold text-ink">Up Next</h3>
          <button onClick={onClose}><X size={22} className="text-muted" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {queue.length === 0 && <p className="text-muted text-sm p-4">Queue is empty.</p>}
          {queue.map((track, i) => {
            const isCurrent = track.id === currentTrack?.id;
            return (
              <div key={`${track.id}-${i}`} className={`flex items-center gap-2 p-2 rounded-lg ${isCurrent ? "bg-panel-2" : ""}`}>
                <img src={track.coverUrl} alt="" className="w-10 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0" onClick={() => playTrack(track, queue)}>
                  <p className={`truncate text-sm font-medium ${isCurrent ? "text-wave-orange" : "text-ink"}`}>{track.title}</p>
                  <p className="truncate text-xs text-muted">{track.artistName}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveInQueue(i, "up")} disabled={i === 0} className="text-muted disabled:opacity-30"><ChevronUp size={18} /></button>
                  <button onClick={() => moveInQueue(i, "down")} disabled={i === queue.length - 1} className="text-muted disabled:opacity-30"><ChevronDown size={18} /></button>
                  {!isCurrent && <button onClick={() => removeFromQueue(i)} className="text-muted ml-1"><X size={16} /></button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}