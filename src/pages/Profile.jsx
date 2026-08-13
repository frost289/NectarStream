import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { getUserTracks } from "../lib/tracks";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserTracks(user.uid).then((data) => {
      setTracks(data);
      setLoading(false);
    });
  }, [user]);

  const totalStreams = tracks.reduce((sum, t) => sum + (t.plays || 0), 0);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <img src={user?.photoURL} alt="" className="w-16 h-16 rounded-full" />
        <div>
          <p className="text-lg font-semibold">{user?.displayName}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm text-slate-300">
        Royalty payments are currently processed manually. Contact the StreetWave admin to confirm your payout details.
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase">Total Streams</p>
          <p className="text-2xl font-bold text-orange-400">{totalStreams}</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase">Tracks</p>
          <p className="text-2xl font-bold text-orange-400">{tracks.length}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Your Songs</h2>
        {loading && <p className="text-slate-400">Loading...</p>}
        {!loading && tracks.length === 0 && (
          <p className="text-slate-400">You haven't uploaded any tracks yet.</p>
        )}
        <div className="flex flex-col gap-2">
          {tracks.map((track) => (
            <div key={track.id} className="flex items-center gap-3 bg-slate-900 rounded-lg p-3">
              <img src={track.coverUrl} alt="" className="w-12 h-12 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-white">{track.title}</p>
                <p className="text-xs text-slate-400">{track.plays || 0} streams</p>
              </div>
              <span className="text-xs border border-emerald-700 text-emerald-400 rounded-full px-2 py-1">LIVE</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => navigate("/studio")} className="bg-orange-400 text-black font-semibold rounded-full py-3">
        Upload a Track
      </button>

      <button onClick={handleLogout} className="border border-slate-700 text-white rounded-full py-3">
        Log Out
      </button>
    </div>
  );
}
