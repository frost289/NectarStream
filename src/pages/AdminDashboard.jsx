import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Star, ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { subscribeToPendingTracks, subscribeToAllTracksAdmin, approveTrack, rejectTrack, setTrackTier } from "../lib/tracks";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [allTracks, setAllTracks] = useState([]);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const unsub1 = subscribeToPendingTracks(setPending);
    const unsub2 = subscribeToAllTracksAdmin(setAllTracks);
    return () => { unsub1(); unsub2(); };
  }, []);

  const handleApprove = async (track, tier) => {
    setBusyId(track.id);
    await approveTrack(track, user, tier);
    setBusyId(null);
  };

  const handleReject = async (track) => {
    if (!window.confirm(`Reject "${track.title}"? The artist will be notified.`)) return;
    setBusyId(track.id);
    await rejectTrack(track, user);
    setBusyId(null);
  };

  const handleToggleTier = async (track) => {
    setBusyId(track.id);
    await setTrackTier(track.id, track.tier === "premium" ? "standard" : "premium");
    setBusyId(null);
  };

  const approvedTracks = allTracks.filter((t) => t.status === "approved");

  return (
    <div className="p-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}><ChevronLeft size={24} className="text-ink" /></button>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Admin Dashboard</h1>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-ink mb-3">Pending Approval ({pending.length})</h2>
        {pending.length === 0 && <p className="text-muted text-sm">Nothing waiting for review.</p>}
        <div className="flex flex-col gap-3">
          {pending.map((track) => (
            <div key={track.id} className="bg-panel border border-line rounded-xl p-3 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img src={track.coverUrl} alt="" className="w-14 h-14 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{track.title}</p>
                  <p className="truncate text-sm text-muted">{track.artistName} · {track.genre || "No genre"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleApprove(track, "standard")} disabled={busyId === track.id}
                  className="flex-1 flex items-center justify-center gap-1 bg-panel-2 text-ink text-sm font-medium rounded-full py-2 disabled:opacity-50">
                  <CheckCircle2 size={16} /> Approve
                </button>
                <button onClick={() => handleApprove(track, "premium")} disabled={busyId === track.id}
                  className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-wave-cyan to-wave-orange text-night text-sm font-semibold rounded-full py-2 disabled:opacity-50">
                  <Star size={16} /> Approve as Premium
                </button>
                <button onClick={() => handleReject(track)} disabled={busyId === track.id}
                  className="flex items-center justify-center gap-1 border border-red-800 text-red-400 text-sm rounded-full px-3 disabled:opacity-50">
                  <XCircle size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink mb-3">Live Tracks ({approvedTracks.length})</h2>
        <p className="text-xs text-muted mb-3">Tap a tier badge to upgrade/downgrade a track that's already live.</p>
        <div className="flex flex-col gap-2">
          {approvedTracks.map((track) => (
            <div key={track.id} className="flex items-center gap-3 bg-panel rounded-xl p-3 border border-line">
              <img src={track.coverUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-ink">{track.title}</p>
                <p className="text-xs text-muted">{track.artistName}</p>
              </div>
              <button onClick={() => handleToggleTier(track)} disabled={busyId === track.id}
                className={`text-xs font-semibold rounded-full px-3 py-1.5 disabled:opacity-50 ${track.tier === "premium" ? "bg-gradient-to-r from-wave-cyan to-wave-orange text-night" : "border border-line text-muted"}`}>
                {track.tier === "premium" ? "Premium" : "Standard"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}