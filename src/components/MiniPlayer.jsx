import { Play, Pause } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

export default function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, setIsExpanded } = usePlayer();
  if (!currentTrack) return null;

  return (
    <div
      onClick={() => setIsExpanded(true)}
      className="fixed bottom-16 left-0 right-0 bg-slate-900 border-t border-slate-800 flex items-center gap-3 p-2 z-10 cursor-pointer"
    >
      <img src={currentTrack.coverUrl} alt="" className="w-10 h-10 rounded object-cover" />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-white">{currentTrack.title}</p>
        <p className="truncate text-xs text-slate-400">{currentTrack.artistName}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        className="text-orange-400"
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
    </div>
  );
}