import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { getAllTracks } from "../lib/tracks";
import { getRecentlyPlayed } from "../lib/recentlyPlayed";
import { getNotifications } from "../lib/notifications";
import { useAuth } from "../context/AuthContext";
import TrackCard from "../components/TrackCard";
import SocialFeed from "../components/SocialFeed";
import Logo from "../components/Logo";
import { usePlayer } from "../context/PlayerContext";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [recent, setRecent] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    getAllTracks().then((data) => {
      setTracks(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    getRecentlyPlayed(user.uid).then(setRecent);
    getNotifications(user.uid).then((data) => setUnreadCount(data.filter((n) => !n.read).length));
  }, [user]);

  const featured = tracks.slice(0, 6);

  return (
    <div className="p-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <Logo className="h-8" />
        {user && (
          <button onClick={() => navigate("/notifications")} className="relative">
            <Bell size={22} className="text-ink" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-wave-orange rounded-full" />}
          </button>
        )}
      </div>

      <h1 className="text-3xl font-bold text-ink mb-6 tracking-tight">For You</h1>

      {loading && <p className="text-muted">Loading tracks...</p>}
      {!loading && tracks.length === 0 && <p className="text-muted">No tracks yet — be the first to upload one.</p>}

      {featured.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8 -mx-4 px-4 snap-x">
          {featured.map((track) => (
            <div key={track.id} onClick={() => playTrack(track, tracks)} className="relative flex-shrink-0 w-40 h-40 rounded-2xl overflow-hidden cursor-pointer snap-start shadow-lg">
              <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night via-night/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="truncate font-semibold text-ink text-sm">{track.title}</p>
                <p className="truncate text-xs text-muted">{track.artistName}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ink mb-3">Recently Played</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {recent.map((track) => (
              <div key={track.id} onClick={() => playTrack(track, recent)} className="flex-shrink-0 w-28 cursor-pointer">
                <img src={track.coverUrl} alt="" className="w-28 h-28 rounded-xl object-cover mb-1.5" />
                <p className="truncate text-xs font-medium text-ink">{track.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <SocialFeed />

      {tracks.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-ink mb-3">All Tracks</h2>
          <div className="flex flex-col gap-2">
            {tracks.map((track) => <TrackCard key={track.id} track={track} queue={tracks} />)}
          </div>
        </>
      )}
    </div>
  );
}