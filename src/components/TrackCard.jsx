import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Pause, Heart } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import { isTrackLiked, toggleLike } from "../lib/likes";
import EqualizerBars from "./EqualizerBars";

export default function TrackCard({ track, queue }) {
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const { user } = useAuth();
  const isActive = currentTrack?.id === track.id;
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (user) isTrackLiked(user.uid, track.id).then(setLiked);
  }, [user, track.id]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (user) setLiked(await toggleLike(user, track));
  };

  return (
    <div onClick={() => playTrack(track, queue)} className={`flex items-center gap-3 rounded-xl p-2.5 cursor-pointer border transition ${isActive ? "bg-panel-2 border-wave-orange/30" : "bg-panel border-transparent active:bg-panel-2"}`}>
      <img src={track.coverUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
      <div className="flex-1 min-w-0">
        <p className={`truncate font-medium ${isActive ? "text-wave-orange" : "text-ink"}`}>{track.title}</p>
        <Link to={`/artist/${track.artistId}`} onClick={(e) => e.stopPropagation()} className="truncate text-sm text-muted block hover:text-wave-cyan">{track.artistName}</Link>
      </div>
      {isActive && isPlaying && <EqualizerBars />}
      {user && <button onClick={handleLike}><Heart size={18} className={liked ? "fill-wave-orange text-wave-orange" : "text-muted"} /></button>}
      {isActive && isPlaying ? <Pause size={20} className="text-wave-orange" /> : <Play size={20} className="text-muted" />}
    </div>
  );
}