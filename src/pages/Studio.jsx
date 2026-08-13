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
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const statusText = {
    "uploading-cover": "Uploading cover image...",
    "uploading-audio": "Uploading audio file...",
    saving: "Saving track details...",
    success: "Track uploaded successfully!",
  }[status];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-orange-400 mb-6">Upload a Track</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Track title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isBusy}
          className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white disabled:opacity-50"
        />
        <input
          type="text"
          placeholder="Genre (e.g. Afrobeats)"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          disabled={isBusy}
          className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white disabled:opacity-50"
        />
        <div>
          <label className="text-sm text-slate-400 block mb-1">Cover image</label>
          <input type="file" accept="image/*" disabled={isBusy} onChange={(e) => setCoverFile(e.target.files[0])} className="text-white" />
        </div>
        <div>
          <label className="text-sm text-slate-400 block mb-1">Audio file</label>
          <input type="file" accept="audio/*" disabled={isBusy} onChange={(e) => setAudioFile(e.target.files[0])} className="text-white" />
        </div>

        {status === "error" && (
          <div className="flex items-center gap-2 bg-red-950 border border-red-800 text-red-400 rounded-lg p-3 text-sm">
            <XCircle size={18} />
            {error}
          </div>
        )}

        {isBusy && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg p-3 text-sm">
            <Loader2 size={18} className="animate-spin" />
            {statusText}
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center gap-2 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-lg p-3 text-sm">
            <CheckCircle2 size={18} />
            {statusText}
          </div>
        )}

        <button
          type="submit"
          disabled={isBusy}
          className="bg-orange-400 text-black font-semibold rounded-full py-3 disabled:opacity-50"
        >
          {isBusy ? "Uploading..." : "Upload Track"}
        </button>
      </form>
    </div>
  );
}