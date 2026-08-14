import { Play, Heart, MessageCircle } from "lucide-react";

export default function TrackStats({ track, className = "" }) {
  return (
    <div className={`flex items-center gap-3 text-[11px] text-muted ${className}`}>
      <span className="flex items-center gap-1"><Play size={10} />{track.plays || 0}</span>
      <span className="flex items-center gap-1"><Heart size={10} />{track.likesCount || 0}</span>
      <span className="flex items-center gap-1"><MessageCircle size={10} />{track.commentsCount || 0}</span>
    </div>
  );
}