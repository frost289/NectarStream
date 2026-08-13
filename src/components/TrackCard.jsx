import { useEffect, useState } from "react";
import { Play, Pause, Heart } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import { isTrackLiked, toggleLike } from "../lib/likes";

export default function TrackCard({ track }) {
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const { user } = useAuth();
  const isActive = currentTrack?.id === track.id;
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (user) isTrackLiked(user.uid, track.id).then(setLiked);
  }, [user, track.id]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return;
    const nowLiked = await toggleLike(user.uid, track);
    setLiked(nowLiked);
  };

  return (
    <div
      onClick={() => playTrack(track)}
      className="flex items-center gap-3 bg-slate-900 rounded-lg p-3 cursor-pointer active:bg-slate-800"
    >
      <img src={track.coverUrl} alt="" className="w-12 h-12 rounded object-cover" />
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-white">{track.title}</p>
        <p className="truncate text-sm text-slate-400">{track.artistName}</p>
      </div>
      {user && (
        <button onClick={handleLike}>
          <Heart size={18} className={liked ? "fill-orange-400 text-orange-400" : "text-slate-500"} />
        </button>
      )}
      {isActive && isPlaying ? (
        <Pause size={20} className="text-orange-400" />
      ) : (
        <Play size={20} className="text-slate-400" />
      )}
    </div>
  );
}