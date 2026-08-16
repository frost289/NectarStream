import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { uploadToCloudinary } from "../lib/cloudinary";
import { createTrack } from "../lib/tracks";

export default function Studio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const isBusy = ["uploading-cover", "uploading-audio", "saving"].includes(status);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile || !coverFile || !title) {
      setError("Title, audio file, and cover image are all required.");
      setStatus("error");
      return;
    }
    setError("");
    try {
      setStatus("uploading-cover");
      const coverUrl = await uploadToCloudinary(coverFile);
      setStatus("uploading-audio");
      const audioUrl = await uploadToCloudinary(audioFile);
      setStatus("saving");
      await createTrack({ title, genre, audioUrl, coverUrl, artist: user });
      setStatus("success");
      setTimeout(() => navigate("/profile"), 1800);
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const statusText = {
    "uploading-cover": "Uploading cover image...",
    "uploading-audio": "Uploading audio file...",
    saving: "Saving track details...",
    success: "Submitted! Your track is pending admin review.",
  }[status];

  return (
    <div className="p-4 pt-6">
      <h1 className="text-3xl font-bold text-ink mb-2 tracking-tight">Upload a Track</h1>
      <p className="text-sm text-muted mb-6">
        New uploads are reviewed by a StreetWave admin before going live. Contact the admin to arrange payment and approval — you'll be notified once it's live.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text" placeholder="Track title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isBusy}
          className="bg-panel border border-line rounded-xl p-3 text-ink placeholder:text-muted disabled:opacity-50 focus:outline-none focus:border-wave-cyan" />
        <input type="text" placeholder="Genre (e.g. Afrobeats)" value={genre} onChange={(e) => setGenre(e.target.value)} disabled={isBusy}
          className="bg-panel border border-line rounded-xl p-3 text-ink placeholder:text-muted disabled:opacity-50 focus:outline-none focus:border-wave-cyan" />
        <div>
          <label className="text-sm text-muted block mb-1">Cover image</label>
          <input type="file" accept="image/*" disabled={isBusy} onChange={(e) => setCoverFile(e.target.files[0])} className="text-ink text-sm" />
        </div>
        <div>
          <label className="text-sm text-muted block mb-1">Audio file</label>
          <input type="file" accept="audio/*" disabled={isBusy} onChange={(e) => setAudioFile(e.target.files[0])} className="text-ink text-sm" />
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 bg-red-950/60 border border-red-800 text-red-400 rounded-xl p-3 text-sm">
            <XCircle size={18} />{error}
          </div>
        )}
        {isBusy && (
          <div className="flex items-center gap-2 bg-panel border border-line text-muted rounded-xl p-3 text-sm">
            <Loader2 size={18} className="animate-spin" />{statusText}
          </div>
        )}
        {status === "success" && (
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl p-3 text-sm">
            <CheckCircle2 size={18} />{statusText}
          </div>
        )}

        <button type="submit" disabled={isBusy}
          className="bg-gradient-to-r from-wave-cyan to-wave-orange text-night font-semibold rounded-full py-3.5 shadow-lg disabled:opacity-50 active:scale-[0.98] transition">
          {isBusy ? "Uploading..." : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}