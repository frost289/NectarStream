import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Trash2, Play } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTracks } from "../context/TracksContext";
import { getPlaylistById, removeTrackFromPlaylist, deletePlaylist } from "../lib/playlists";
import { usePlayer } from "../context/PlayerContext";
import TrackCard from "../components/TrackCard";

export default function PlaylistDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tracks: allTracks } = useTracks();
  const { playTrack } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPlaylist = () => {
    getPlaylistById(id)
      .then((data) => { setPlaylist(data); setLoading(false); })
      .catch(() => { setPlaylist(null); setLoading(false); });
  };

  useEffect(loadPlaylist, [id]);

  if (loading) return <div className="p-4 pt-6 text-muted">Loading...</div>;
  if (!playlist) return <div className="p-4 pt-6 text-muted">Playlist not found, or you don't have access to it.</div>;

  const tracks = allTracks.filter((t) => playlist.trackIds?.includes(t.id));
  const isOwner = user?.uid === playlist.ownerId;

  const handleRemove = async (trackId) => {
    await removeTrackFromPlaylist(id, trackId);
    loadPlaylist();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${playlist.title}"? This can't be undone.`)) return;
    await deletePlaylist(id);
    navigate("/library");
  };

  return (
    <div className="p-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)}><ChevronLeft size={24} className="text-ink" /></button>
        {isOwner && <button onClick={handleDelete}><Trash2 size={20} className="text-red-400" /></button>}
      </div>

      <h1 className="text-2xl font-bold text-ink mb-1 tracking-tight">{playlist.title}</h1>
      <p className="text-muted text-sm mb-6">{tracks.length} tracks</p>

      {tracks.length > 0 && (
        <button onClick={() => playTrack(tracks[0], tracks)} className="flex items-center gap-2 bg-gradient-to-r from-wave-cyan to-wave-orange text-night font-semibold rounded-full px-6 py-3 mb-6">
          <Play size={18} /> Play All
        </button>
      )}

      {tracks.length === 0 && <p className="text-muted">No tracks in this playlist yet.</p>}

      <div className="flex flex-col gap-2">
        {tracks.map((track) => (
          <div key={track.id} className="flex items-center gap-2">
            <div className="flex-1"><TrackCard track={track} queue={tracks} /></div>
            {isOwner && <button onClick={() => handleRemove(track.id)} className="text-muted"><Trash2 size={16} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}