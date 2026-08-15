import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { registerAsArtist } from "../lib/users";

export default function BecomeArtist() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [artistName, setArtistName] = useState(profile?.displayName || user?.displayName || "");
  const [bio, setBio] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!artistName.trim() || !agreed) {
      setError("Artist name is required, and you need to agree to the terms.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await registerAsArtist(user.uid, { artistName: artistName.trim(), bio });
      navigate("/studio");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setSaving(false);
    }
  };

  return (
    <div className="p-4 pt-6">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-wave-cyan to-wave-orange flex items-center justify-center mb-4">
          <Mic2 size={28} className="text-night" />
        </div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Become an Artist</h1>
        <p className="text-muted text-sm mt-2">Register to start uploading tracks on StreetWave.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-muted block mb-1">Artist / stage name</label>
          <input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} disabled={saving}
            className="w-full bg-panel border border-line rounded-xl p-3 text-ink disabled:opacity-50 focus:outline-none focus:border-wave-cyan" />
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">Short bio (optional)</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} disabled={saving}
            className="w-full bg-panel border border-line rounded-xl p-3 text-ink resize-none disabled:opacity-50 focus:outline-none focus:border-wave-cyan" />
        </div>

        <div className="bg-panel border border-line rounded-xl p-4 text-sm text-muted">
          Royalty payments are currently processed manually by StreetWave admins. Payment automation is coming soon.
        </div>

        <label className="flex items-start gap-2 text-sm text-muted">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} disabled={saving} className="mt-1" />
          I confirm I own the rights to any music I upload to StreetWave.
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="bg-gradient-to-r from-wave-cyan to-wave-orange text-night font-semibold rounded-full py-3.5 shadow-lg disabled:opacity-50">
          {saving ? "Registering..." : "Register as Artist"}
        </button>
      </form>
    </div>
  );
}