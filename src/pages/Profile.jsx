import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { Pencil, UserCog, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { getUserById } from "../lib/users";
import { subscribeToUserTracks } from "../lib/tracks";
import EditTrackSheet from "../components/EditTrackSheet";
import EditProfileSheet from "../components/EditProfileSheet";
import TrackStats from "../components/TrackStats";

const STATUS_LABEL = {
  pending: { text: "Pending Review", cls: "border-yellow-600/50 text-yellow-400" },
  approved: { text: "Live", cls: "border-wave-cyan/40 text-wave-cyan" },
  rejected: { text: "Not Approved", cls: "border-red-800 text-red-400" },
};

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [editingTrack, setEditingTrack] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);

  const loadProfile = () => {
    if (!user) return;
    getUserById(user.uid).then(setProfile);
  };

  useEffect(loadProfile, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserTracks(user.uid, (data) => {
      setTracks(data);
      setTracksLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const totalStreams = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (!profile) return <div className="p-4 pt-6 text-muted">Loading...</div>;

  const isArtist = profile.role === "artist";

  return (
    <div className="p-4 pt-6 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <img src={profile.photoURL} alt="" className="w-16 h-16 rounded-full ring-2 ring-wave-orange/40 object-cover" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-ink truncate">{profile.displayName}</p>
            {isArtist && <span className="text-[10px] border border-wave-cyan/40 text-wave-cyan rounded-full px-2 py-0.5 flex-shrink-0">ARTIST</span>}
          </div>
          <p className="text-sm text-muted">{profile.email}</p>
          {profile.bio && <p className="text-sm text-muted mt-1">{profile.bio}</p>}
        </div>
        <button onClick={() => setEditingProfile(true)} className="text-muted"><UserCog size={20} /></button>
      </div>

      {profile.isAdmin && (
        <button onClick={() => navigate("/admin")} className="flex items-center justify-center gap-2 border border-wave-cyan/40 text-wave-cyan rounded-full py-3 font-medium">
          <ShieldCheck size={18} /> Admin Dashboard
        </button>
      )}

      <div className="bg-panel border border-line rounded-xl p-4 text-sm text-muted">
        Royalty payments are currently processed manually. Contact the StreetWave admin to complete approval and payment for new uploads.
      </div>

      {isArtist && (
        <>
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
            {tracksLoading && <p className="text-muted">Loading...</p>}
            {!tracksLoading && tracks.length === 0 && <p className="text-muted">You haven't uploaded any tracks yet.</p>}
            <div className="flex flex-col gap-2">
              {tracks.map((track) => {
                const statusInfo = STATUS_LABEL[track.status] || STATUS_LABEL.approved;
                return (
                  <div key={track.id} className="flex items-center gap-3 bg-panel rounded-xl p-3 border border-line">
                    <img src={track.coverUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-ink">{track.title}</p>
                      <TrackStats track={track} className="mt-0.5" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] border rounded-full px-2 py-0.5 ${statusInfo.cls}`}>{statusInfo.text}</span>
                      {track.status === "approved" && track.tier === "premium" && (
                        <span className="text-[10px] bg-gradient-to-r from-wave-cyan to-wave-orange text-night font-bold rounded-full px-2 py-0.5">PREMIUM</span>
                      )}
                    </div>
                    <button onClick={() => setEditingTrack(track)} className="text-muted"><Pencil size={16} /></button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {isArtist ? (
        <button onClick={() => navigate("/studio")} className="bg-gradient-to-r from-wave-cyan to-wave-orange text-night font-semibold rounded-full py-3.5 shadow-lg active:scale-[0.98] transition">
          Upload a Track
        </button>
      ) : (
        <button onClick={() => navigate("/become-artist")} className="border border-wave-cyan text-wave-cyan font-semibold rounded-full py-3.5">
          Become an Artist
        </button>
      )}
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