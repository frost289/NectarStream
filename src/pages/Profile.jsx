import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { Pencil, UserCog } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTracks } from "../context/TracksContext";
import { auth } from "../firebase";
import { getUserById } from "../lib/users";
import EditTrackSheet from "../components/EditTrackSheet";
import EditProfileSheet from "../components/EditProfileSheet";

export default function Profile() {
  const { user } = useAuth();
  const { tracks: allTracks, loading } = useTracks();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editingTrack, setEditingTrack] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);

  const loadProfile = () => {
    if (!user) return;
    getUserById(user.uid).then(setProfile);
  };

  useEffect(loadProfile, [user]);

  const tracks = allTracks.filter((t) => t.artistId === user?.uid);
  const totalStreams = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (!profile) return <div className="p-4 pt-6 text-muted">Loading...</div>;

  return (
    <div className="p-4 pt-6 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <img src={profile.photoURL} alt="" className="w-16 h-16 rounded-full ring-2 ring-wave-orange/40 object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-ink">{profile.displayName}</p>
          <p className="text-sm text-muted">{profile.email}</p>
          {profile.bio && <p className="text-sm text-muted mt-1">{profile.bio}</p>}
        </div>
        <button onClick={() => setEditingProfile(true)} className="text-muted"><UserCog size={20} /></button>
      </div>

      <div className="bg-panel border border-line rounded-xl p-4 text-sm text-muted">
        Royalty payments are currently processed manually. Contact the StreetWave admin to confirm your payout details.
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-panel rounded-xl p-4 border border-line">
          <p className="text-xs text-muted uppercase tracking-wide">Total Streams</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-wave-cyan to-wave-orange bg-clip-text text-transparent">{totalStreams}</p>
        </div>
        <div className="bg-panel rounded-xl p-4 border border-line">
          <p className="text-xs text-muted uppercase tracking-wide">Tracks</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-wave-cyan to-wave-orange bg-clip-text text-transparent">{tracks.length}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink mb-3">Your Songs</h2>
        {loading && <p className="text-muted">Loading...</p>}
        {!loading && tracks.length === 0 && <p className="text-muted">You haven't uploaded any tracks yet.</p>}
        <div className="flex flex-col gap-2">
          {tracks.map((track) => (
            <div key={track.id} className="flex items-center gap-3 bg-panel rounded-xl p-3 border border-line">
              <img src={track.coverUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-ink">{track.title}</p>
                <p className="text-xs text-muted">{track.plays || 0} streams</p>
              </div>
              <span className="text-xs border border-wave-cyan/40 text-wave-cyan rounded-full px-2 py-1">LIVE</span>
              <button onClick={() => setEditingTrack(track)} className="text-muted"><Pencil size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => navigate("/studio")} className="bg-gradient-to-r from-wave-cyan to-wave-orange text-night font-semibold rounded-full py-3.5 shadow-lg active:scale-[0.98] transition">
        Upload a Track
      </button>
      <button onClick={handleLogout} className="border border-line text-ink rounded-full py-3.5">Log Out</button>

      {editingTrack && (
        <EditTrackSheet track={editingTrack} onClose={() => setEditingTrack(null)} onSaved={() => setEditingTrack(null)} onDeleted={() => setEditingTrack(null)} />
      )}
      {editingProfile && (
        <EditProfileSheet profile={profile} onClose={() => setEditingProfile(false)} onSaved={() => { setEditingProfile(false); loadProfile(); }} />
      )}
    </div>
  );
}