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
    const matchesQuery = query.trim() === "" || track.title?.toLowerCase().includes(query.toLowerCase()) || track.artistName?.toLowerCase().includes(query.toLowerCase());
    const matchesGenre = activeGenre === "All" || track.genre?.toLowerCase() === activeGenre.toLowerCase();
    return matchesQuery && matchesGenre;
  });

  return (
    <div className="p-4 pt-6">
      <h1 className="text-3xl font-bold text-ink mb-5 tracking-tight">Search</h1>

      <div className="relative mb-4">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Artists, songs, or genres"
          className="w-full bg-panel border border-line rounded-full py-3 pl-11 pr-4 text-ink placeholder:text-muted focus:outline-none focus:border-wave-cyan"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 -mx-4 px-4">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              activeGenre === genre ? "bg-gradient-to-r from-wave-cyan to-wave-orange text-night" : "bg-panel text-muted border border-line"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {loading && <p className="text-muted">Loading tracks...</p>}
      {!loading && filtered.length === 0 && <p className="text-muted">No tracks match your search.</p>}

      <div className="flex flex-col gap-2">
        {filtered.map((track) => <TrackCard key={track.id} track={track} />)}
      </div>
    </div>
  );
}