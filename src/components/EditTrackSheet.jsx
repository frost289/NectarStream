import { useState } from "react";
import { X } from "lucide-react";
import { updateTrack, deleteTrack } from "../lib/tracks";

export default function EditTrackSheet({ track, onClose, onSaved, onDeleted }) {
  const [title, setTitle] = useState(track.title);
  const [genre, setGenre] = useState(track.genre || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateTrack(track.id, { title, genre });
    setSaving(false);
    onSaved();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${track.title}"? This can't be undone.`)) return;
    setSaving(true);
    await deleteTrack(track.id);
    setSaving(false);
    onDeleted();
  };

  return (
    <div className="fixed inset-0 bg-night/70 z-[60] flex items-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-panel w-full rounded-t-2xl flex flex-col border-t border-line p-4 gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink">Edit Track</h3>
          <button onClick={onClose}><X size={22} className="text-muted" /></button>
        </div>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-panel-2 border border-line rounded-xl p-3 text-ink focus:outline-none focus:border-wave-cyan" />
        <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Genre" className="bg-panel-2 border border-line rounded-xl p-3 text-ink placeholder:text-muted focus:outline-none focus:border-wave-cyan" />
        <button onClick={handleSave} disabled={saving || !title.trim()} className="bg-gradient-to-r from-wave-cyan to-wave-orange text-night font-semibold rounded-full py-3 disabled:opacity-50">
          Save Changes
        </button>
        <button onClick={handleDelete} disabled={saving} className="border border-red-800 text-red-400 rounded-full py-3 disabled:opacity-50">
          Delete Track
        </button>
      </div>
    </div>
  );
}