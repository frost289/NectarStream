import { useEffect, useState } from "react";
import { X, Check, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getUserPlaylists, createPlaylist, addTrackToPlaylist } from "../lib/playlists";

export default function AddToPlaylistSheet({ track, onClose }) {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [addedIds, setAddedIds] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getUserPlaylists(user.uid).then(setPlaylists);
  }, [user]);

  const handleAdd = async (playlist) => {
    await addTrackToPlaylist(playlist.id, track);
    setAddedIds((ids) => [...ids, playlist.id]);
  };

  const handleCreateAndAdd = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const ref = await createPlaylist(user, newTitle.trim());
    await addTrackToPlaylist(ref.id, track);
    setPlaylists((p) => [{ id: ref.id, title: newTitle.trim(), trackIds: [track.id] }, ...p]);
    setAddedIds((ids) => [...ids, ref.id]);
    setNewTitle("");
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-night/70 z-[70] flex items-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-panel w-full max-h-[80vh] rounded-t-2xl flex flex-col border-t border-line">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h3 className="font-semibold text-ink">Add to Playlist</h3>
          <button onClick={onClose}><X size={22} className="text-muted" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {playlists.map((playlist) => {
            const added = addedIds.includes(playlist.id) || playlist.trackIds?.includes(track.id);
            return (
              <button key={playlist.id} onClick={() => !added && handleAdd(playlist)} className="w-full flex items-center gap-3 p-3 rounded-lg active:bg-panel-2">
                <div className="w-10 h-10 rounded-lg bg-panel-2 flex-shrink-0" />
                <p className="flex-1 text-left truncate text-ink text-sm">{playlist.title}</p>
                {added && <Check size={18} className="text-wave-orange" />}
              </button>
            );
          })}
          {playlists.length === 0 && <p className="text-muted text-sm p-4">No playlists yet — create one below.</p>}
        </div>

        <div className="flex items-center gap-2 p-4 border-t border-line">
          <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New playlist name"
            className="flex-1 bg-panel-2 rounded-full px-4 py-2 text-ink text-sm placeholder:text-muted focus:outline-none" />
          <button onClick={handleCreateAndAdd} disabled={creating || !newTitle.trim()} className="text-wave-orange disabled:opacity-40">
            <Plus size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}