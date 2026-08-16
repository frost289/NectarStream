import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createPlaylist } from "../lib/playlists";

export default function CreatePlaylistSheet({ onClose, onCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const ref = await createPlaylist(user, title.trim());
      onCreated(ref.id);
    } catch (err) {
      setError(err.message || "Couldn't create playlist.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-night/70 z-[60] flex items-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-panel w-full max-h-[85vh] rounded-t-2xl flex flex-col border-t border-line p-4 gap-4 overflow-y-auto pb-32">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink">New Playlist</h3>
          <button onClick={onClose}><X size={22} className="text-muted" /></button>
        </div>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Playlist name" disabled={saving}
          className="bg-panel-2 border border-line rounded-xl p-3 text-ink disabled:opacity-50 focus:outline-none focus:border-wave-cyan" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button onClick={handleCreate} disabled={saving || !title.trim()} className="bg-gradient-to-r from-wave-cyan to-wave-orange text-night font-semibold rounded-full py-3 disabled:opacity-50">
          {saving ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
}