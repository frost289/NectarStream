import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useTracks } from "../context/TracksContext";
import { getRecentlyPlayed } from "../lib/recentlyPlayed";
import { getNotifications } from "../lib/notifications";
import { useAuth } from "../context/AuthContext";
import TrackCard from "../components/TrackCard";
import TrackTile from "../components/TrackTile";
import SuggestedArtists from "../components/SuggestedArtists";
import Logo from "../components/Logo";
import { usePlayer } from "../context/PlayerContext";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tracks, loading } = useTracks();
  const [recent, setRecent] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { playTrack } = usePlayer();

  useEffect(() => {
    if (!user) return;
    getRecentlyPlayed(user.uid).then(setRecent);
    getNotifications(user.uid).then((data) => setUnreadCount(data.filter((n) => !n.read).length));
  }, [user]);

  const featured = tracks.filter((t) => t.tier === "premium").slice(0, 8);
  const newReleases = tracks.slice(0, 8);
  const popular = [...tracks].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 8);
  const allSorted = [...tracks].sort((a, b) => (b.tier === "premium") - (a.tier === "premium"));

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

      <h1 className="text-2xl font-bold text-ink mb-6 tracking-tight">
        {getGreeting()}{user ? `, ${user.displayName?.split(" ")[0]}` : ""}
      </h1>

      {loading && <p className="text-muted">Loading tracks...</p>}
      {!loading && tracks.length === 0 && <p className="text-muted">No tracks yet — be the first to upload one.</p>}

      {featured.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ink mb-3">Featured</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {featured.map((track) => <TrackTile key={track.id} track={track} onClick={() => playTrack(track, featured)} />)}
          </div>
        </div>
      )}

      {user && <SuggestedArtists />}

      {recent.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ink mb-3">Jump back in</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {recent.map((track) => <TrackTile key={track.id} track={track} onClick={() => playTrack(track, recent)} />)}
          </div>
        </div>
      )}

      {newReleases.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ink mb-3">New Releases</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {newReleases.map((track) => <TrackTile key={track.id} track={track} onClick={() => playTrack(track, newReleases)} />)}
          </div>
        </div>
      )}

      {popular.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ink mb-3">Popular Right Now</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {popular.map((track) => <TrackTile key={track.id} track={track} onClick={() => playTrack(track, popular)} />)}
          </div>
        </div>
      )}

      {tracks.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-ink mb-3">All Tracks</h2>
          <div className="flex flex-col gap-2">
            {allSorted.map((track) => <TrackCard key={track.id} track={track} queue={allSorted} />)}
          </div>
        </>
      )}
    </div>
  );
}