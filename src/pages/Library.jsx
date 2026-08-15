import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTracks } from "../context/TracksContext";
import { getUserLikedTrackIds } from "../lib/likes";
import { getUserPlaylists } from "../lib/playlists";
import TrackCard from "../components/TrackCard";
import CreatePlaylistSheet from "../components/CreatePlaylistSheet";

export default function Library() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tracks: allTracks, loading: tracksLoading } = useTracks();
  const [likedIds, setLikedIds] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const loadPlaylists = () => {
    if (!user) return;
    getUserPlaylists(user.uid).then(setPlaylists);
  };

  useEffect(() => {
    if (!user) return;
    getUserLikedTrackIds(user.uid).then(setLikedIds);
    loadPlaylists();
  }, [user]);

  const loading = tracksLoading || likedIds === null;
  const likedTracks = likedIds ? allTracks.filter((t) => likedIds.includes(t.id)) : [];

  return (
    <div className="p-4 pt-6">
      <h1 className="text-3xl font-bold text-ink mb-6 tracking-tight">Your Library</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-ink mb-3">Playlists</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          <div onClick={() => setShowCreate(true)} className="flex-shrink-0 w-32 h-32 rounded-lg bg-panel border border-dashed border-line flex flex-col items-center justify-center gap-1 cursor-pointer">
            <Plus size={24} className="text-muted" />
            <p className="text-xs text-muted">New Playlist</p>
          </div>
          {playlists.map((playlist) => (
            <div key={playlist.id} onClick={() => navigate(`/playlist/${playlist.id}`)} className="flex-shrink-0 w-32 cursor-pointer">
              {playlist.coverUrl ? (
                <img src={playlist.coverUrl} alt="" className="w-32 h-32 rounded-lg object-cover mb-2" />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-panel-2 mb-2" />
              )}
              <p className="truncate text-sm font-medium text-ink">{playlist.title}</p>
              <p className="text-xs text-muted">{playlist.trackIds?.length || 0} tracks</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-ink mb-3">Liked Songs</h2>
      {loading && <p className="text-muted">Loading...</p>}
      {!loading && likedTracks.length === 0 && <p className="text-muted">Tracks you like will show up here.</p>}
      <div className="flex flex-col gap-2">
        {likedTracks.map((track) => <TrackCard key={track.id} track={track} queue={likedTracks} />)}
      </div>

      {showCreate && (
        <CreatePlaylistSheet onClose={() => setShowCreate(false)} onCreated={(id) => { setShowCreate(false); loadPlaylists(); navigate(`/playlist/${id}`); }} />
      )}
    </div>
  );
}