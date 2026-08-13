import { useState } from "react";
import { X } from "lucide-react";
import { updateUserProfile } from "../lib/users";
import { uploadToCloudinary } from "../lib/cloudinary";

export default function EditProfileSheet({ profile, onClose, onSaved }) {
  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    let photoURL = null;
    if (avatarFile) photoURL = await uploadToCloudinary(avatarFile);
    await updateUserProfile(profile.id, { displayName, bio, photoURL });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-night/70 z-[60] flex items-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-panel w-full rounded-t-2xl flex flex-col border-t border-line p-4 gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ink">Edit Profile</h3>
          <button onClick={onClose}><X size={22} className="text-muted" /></button>
        </div>
        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name"
          className="bg-panel-2 border border-line rounded-xl p-3 text-ink focus:outline-none focus:border-wave-cyan" />
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio" rows={3}
          className="bg-panel-2 border border-line rounded-xl p-3 text-ink resize-none focus:outline-none focus:border-wave-cyan" />
        <div>
          <label className="text-sm text-muted block mb-1">New profile photo (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="text-ink text-sm" />
        </div>
        <button onClick={handleSave} disabled={saving || !displayName.trim()} className="bg-gradient-to-r from-wave-cyan to-wave-orange text-night font-semibold rounded-full py-3 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}