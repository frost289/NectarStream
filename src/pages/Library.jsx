import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserLikedTracks } from "../lib/likes";
import TrackCard from "../components/TrackCard";

export default function Library() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserLikedTracks(user.uid).then((data) => {
      setTracks(data);
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="p-4 pt-6">
      <h1 className="text-3xl font-bold text-ink mb-6 tracking-tight">Your Library</h1>
      {loading && <p className="text-muted">Loading...</p>}
      {!loading && tracks.length === 0 && <p className="text-muted">Tracks you like will show up here.</p>}
      <div className="flex flex-col gap-2">
        {tracks.map((track) => <TrackCard key={track.id} track={track} />)}
      </div>
    </div>
  );
}