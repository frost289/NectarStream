import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { getAllTracks } from "../lib/tracks";
import TrackCard from "../components/TrackCard";

const GENRES = ["All", "Afrobeats", "Hip Hop", "Amapiano", "R&B", "Deep House"];

export default function Search() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");

  useEffect(() => {
    getAllTracks().then((data) => {
      setTracks(data);
      setLoading(false);
    });
  }, []);

  const filtered = tracks.filter((track) => {
    const matchesQuery =
      query.trim() === "" ||
      track.title?.toLowerCase().includes(query.toLowerCase()) ||
      track.artistName?.toLowerCase().includes(query.toLowerCase());

    const matchesGenre =
      activeGenre === "All" ||
      track.genre?.toLowerCase() === activeGenre.toLowerCase();

    return matchesQuery && matchesGenre;
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-orange-400 mb-4">Search</h1>

      <div className="relative mb-4">
        <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artists, songs, or genres"
          className="w-full bg-slate-900 border border-slate-700 rounded-full py-3 pl-10 pr-4 text-white"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 -mx-4 px-4">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
              activeGenre === genre
                ? "bg-orange-400 text-black"
                : "bg-slate-900 text-slate-300 border border-slate-700"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {loading && <p className="text-slate-400">Loading tracks...</p>}
      {!loading && filtered.length === 0 && (
        <p className="text-slate-400">No tracks match your search.</p>
      )}

      <div className="flex flex-col gap-2">
        {filtered.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
}