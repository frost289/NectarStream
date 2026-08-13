import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTracks } from "../context/TracksContext";
import { getUserLikedTrackIds } from "../lib/likes";
import TrackCard from "../components/TrackCard";

export default function Library() {
  const { user } = useAuth();
  const { tracks: allTracks, loading: tracksLoading } = useTracks();
  const [likedIds, setLikedIds] = useState(null);

  useEffect(() => {
    if (!user) return;
    getUserLikedTrackIds(user.uid).then(setLikedIds);
  }, [user]);

  const loading = tracksLoading || likedIds === null;
  const tracks = likedIds ? allTracks.filter((t) => likedIds.includes(t.id)) : [];

  return (
    <div className="p-4 pt-6">
      <h1 className="text-3xl font-bold text-ink mb-6 tracking-tight">Your Library</h1>
      {loading && <p className="text-muted">Loading...</p>}
      {!loading && tracks.length === 0 && <p className="text-muted">Tracks you like will show up here.</p>}
      <div className="flex flex-col gap-2">
        {tracks.map((track) => <TrackCard key={track.id} track={track} queue={tracks} />)}
      </div>
    </div>
  );
}