import { Play, Pause } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import EqualizerBars from "./EqualizerBars";

export default function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, setIsExpanded, progress, duration } = usePlayer();
  if (!currentTrack) return null;

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div onClick={() => setIsExpanded(true)} className="fixed bottom-16 left-0 right-0 bg-panel border-t border-line z-10 cursor-pointer">
      <div className="h-0.5 bg-line">
        <div className="h-full bg-gradient-to-r from-wave-cyan to-wave-orange" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center gap-3 p-2">
        <img src={currentTrack.coverUrl} alt="" className="w-10 h-10 rounded-md object-cover" />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-ink">{currentTrack.title}</p>
          <p className="truncate text-xs text-muted">{currentTrack.artistName}</p>
        </div>
        {isPlaying && <EqualizerBars />}
        <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-ink">
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
      </div>
    </div>
  );
}