import { useEffect, useState } from "react";
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Share2, Download, Heart, MessageCircle } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import { isTrackLiked, toggleLike } from "../lib/likes";
import CommentSheet from "./CommentSheet";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function NowPlaying() {
  const { currentTrack, isPlaying, isExpanded, setIsExpanded, progress, duration, togglePlay, seekTo } = usePlayer();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (user && currentTrack) isTrackLiked(user.uid, currentTrack.id).then(setLiked);
  }, [user, currentTrack]);

  if (!isExpanded || !currentTrack) return null;

  const handleSeek = (e) => seekTo((e.target.value / 100) * duration);

  const handleLike = async () => {
    if (!user) return;
    const nowLiked = await toggleLike(user, currentTrack);
    setLiked(nowLiked);
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

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setIsExpanded(false)}><ChevronDown size={28} className="text-white" /></button>
        <span className="text-sm text-slate-400 uppercase tracking-wide">Now Playing</span>
        <div className="w-7" />
      </div>

      <img src={currentTrack.coverUrl} alt="" className="w-full aspect-square rounded-2xl object-cover mb-8" />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{currentTrack.title}</h2>
          <p className="text-slate-400">{currentTrack.artistName}</p>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <button onClick={handleLike}>
              <Heart size={24} className={liked ? "fill-orange-400 text-orange-400" : "text-slate-400"} />
            </button>
          )}
          <button onClick={() => setShowComments(true)}>
            <MessageCircle size={24} className="text-slate-400" />
          </button>
        </div>
      </div>

      <input type="range" min="0" max="100" value={duration ? (progress / duration) * 100 : 0} onChange={handleSeek} className="w-full accent-orange-400 mb-1" />
      <div className="flex justify-between text-sm text-slate-400 mb-8">
        <span>{formatTime(progress)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="flex items-center justify-center gap-8 mb-10">
        <Shuffle size={22} className="text-slate-500" />
        <SkipBack size={28} className="text-white" />
        <button onClick={togglePlay} className="bg-orange-400 rounded-full w-16 h-16 flex items-center justify-center">
          {isPlaying ? <Pause size={28} className="text-black" /> : <Play size={28} className="text-black ml-1" />}
        </button>
        <SkipForward size={28} className="text-white" />
        <Repeat size={22} className="text-slate-500" />
      </div>

      <div className="flex justify-center gap-12">
        <button onClick={handleShare} className="flex flex-col items-center gap-1 text-slate-400">
          <Share2 size={20} /><span className="text-xs">Share</span>
        </button>
        <button onClick={handleDownload} className="flex flex-col items-center gap-1 text-slate-400">
          <Download size={20} /><span className="text-xs">Download</span>
        </button>
      </div>

      {showComments && <CommentSheet track={currentTrack} onClose={() => setShowComments(false)} />}
    </div>
  );
}