import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { updateUserProfile } from "../lib/users";
import { uploadToCloudinary } from "../lib/cloudinary";

export default function EditProfileSheet({ profile, onClose, onSaved }) {
  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      let photoURL = null;
      if (avatarFile) photoURL = await uploadToCloudinary(avatarFile);
      await updateUserProfile(profile.id, { displayName, bio, photoURL });
      onSaved();
    } catch (err) {
      setError(err.message || "Something went wrong saving your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-night/70 z-[60] flex items-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-panel w-full max-h-[85vh] rounded-t-2xl flex flex-col border-t border-line p-4 gap-4 overflow-y-auto pb-32">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink">Edit Profile</h3>
          <button onClick={onClose}><X size={22} className="text-muted" /></button>
        </div>
        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" disabled={saving}
          className="bg-panel-2 border border-line rounded-xl p-3 text-ink focus:outline-none focus:border-wave-cyan disabled:opacity-50" />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio" rows={3} disabled={saving}
          className="bg-panel-2 border border-line rounded-xl p-3 text-ink resize-none focus:outline-none focus:border-wave-cyan disabled:opacity-50" />
        <div>
          <label className="text-sm text-muted block mb-1">New profile photo (optional)</label>
          <input type="file" accept="image/*" disabled={saving} onChange={(e) => setAvatarFile(e.target.files[0])} className="text-ink text-sm" />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button onClick={handleSave} disabled={saving || !displayName.trim()} className="bg-gradient-to-r from-wave-cyan to-wave-orange text-night font-semibold rounded-full py-3 disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}