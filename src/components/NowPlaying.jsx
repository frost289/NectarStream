import { useEffect, useState } from "react";
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Share2, Download, Heart, MessageCircle, ListMusic } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import { isTrackLiked, toggleLike } from "../lib/likes";
import { isFollowing, toggleFollow } from "../lib/follows";
import CommentSheet from "./CommentSheet";
import QueueSheet from "./QueueSheet";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function NowPlaying() {
  const { currentTrack, isPlaying, isExpanded, setIsExpanded, progress, duration, togglePlay, seekTo, goToNext, goToPrevious, shuffleOn, toggleShuffle, repeatMode, cycleRepeat } = usePlayer();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [followingArtist, setFollowingArtist] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    if (user && currentTrack) {
      isTrackLiked(user.uid, currentTrack.id).then(setLiked);
      isFollowing(user.uid, currentTrack.artistId).then(setFollowingArtist);
    }
  }, [user, currentTrack]);

  if (!isExpanded || !currentTrack) return null;

  const pct = duration ? (progress / duration) * 100 : 0;
  const handleSeek = (e) => seekTo((e.target.value / 100) * duration);
  const handleLike = async () => { if (user) setLiked(await toggleLike(user, currentTrack)); };
  const handleFollow = async () => {
    if (!user) return;
    setFollowingArtist(await toggleFollow(user, currentTrack.artistId, currentTrack.artistName));
  };
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentTrack.audioUrl;
    link.download = `${currentTrack.title}.mp3`;
    link.click();
  };
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: currentTrack.title, text: `Listen to ${currentTrack.title} on StreetWave`, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard");
    }
  };

  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;
  const isSelfArtist = user?.uid === currentTrack.artistId;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-panel to-night z-50 flex flex-col p-5 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setIsExpanded(false)}><ChevronDown size={28} className="text-ink" /></button>
        <span className="text-xs font-semibold text-muted uppercase tracking-widest">Now Playing</span>
        <button onClick={() => setShowQueue(true)}><ListMusic size={22} className="text-ink" /></button>
      </div>

      <img src={currentTrack.coverUrl} alt="" className="w-full aspect-square rounded-2xl object-cover mb-8 shadow-2xl" />

      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-ink truncate">{currentTrack.title}</h2>
          <p className="text-muted truncate">{currentTrack.artistName}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 pl-4">
          {user && <button onClick={handleLike}><Heart size={24} className={liked ? "fill-wave-orange text-wave-orange" : "text-muted"} /></button>}
          <button onClick={() => setShowComments(true)}><MessageCircle size={24} className="text-muted" /></button>
        </div>
      </div>

      {user && !isSelfArtist && (
        <button onClick={handleFollow} className={`self-start text-xs font-semibold rounded-full px-3 py-1.5 mb-6 ${followingArtist ? "border border-line text-ink" : "bg-gradient-to-r from-wave-cyan to-wave-orange text-night"}`}>
          {followingArtist ? "Following" : "Follow Artist"}
        </button>
      )}

      <div className="relative h-1.5 w-full mb-2 mt-2">
        <div className="absolute inset-0 rounded-full bg-line" />
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-wave-cyan to-wave-orange" style={{ width: `${pct}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-ink shadow -ml-1.5 pointer-events-none" style={{ left: `${pct}%` }} />
        <input type="range" min="0" max="100" value={pct} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
      <div className="flex justify-between text-xs text-muted mb-8">
        <span>{formatTime(progress)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="flex items-center justify-center gap-8 mb-10">
        <button onClick={toggleShuffle}><Shuffle size={20} className={shuffleOn ? "text-wave-orange" : "text-muted"} /></button>
        <button onClick={goToPrevious}><SkipBack size={26} className="text-ink" /></button>
        <button onClick={togglePlay} className="bg-gradient-to-br from-wave-cyan to-wave-orange rounded-full w-16 h-16 flex items-center justify-center shadow-lg active:scale-95 transition">
          {isPlaying ? <Pause size={28} className="text-night" /> : <Play size={28} className="text-night ml-1" />}
        </button>
        <button onClick={goToNext}><SkipForward size={26} className="text-ink" /></button>
        <button onClick={cycleRepeat}><RepeatIcon size={20} className={repeatMode !== "off" ? "text-wave-orange" : "text-muted"} /></button>
      </div>

      <div className="flex justify-center gap-12">
        <button onClick={handleShare} className="flex flex-col items-center gap-1 text-muted"><Share2 size={20} /><span className="text-xs">Share</span></button>
        <button onClick={handleDownload} className="flex flex-col items-center gap-1 text-muted"><Download size={20} /><span className="text-xs">Download</span></button>
      </div>

      {showComments && <CommentSheet track={currentTrack} onClose={() => setShowComments(false)} />}
      {showQueue && <QueueSheet onClose={() => setShowQueue(false)} />}
    </div>
  );
}