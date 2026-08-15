import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { useTracks } from "../context/TracksContext";
import { getAllArtists } from "../lib/artists";
import TrackCard from "../components/TrackCard";

const GENRES = ["All", "Afrobeats", "Hip Hop", "Amapiano", "R&B", "Deep House"];

export default function Search() {
  const navigate = useNavigate();
  const { tracks, loading } = useTracks();
  const [query, setQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [mode, setMode] = useState("tracks");
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    getAllArtists().then(setArtists);
  }, []);

  const filteredTracks = tracks.filter((track) => {
    const matchesQuery = query.trim() === "" || track.title?.toLowerCase().includes(query.toLowerCase()) || track.artistName?.toLowerCase().includes(query.toLowerCase());
    const matchesGenre = activeGenre === "All" || track.genre?.toLowerCase() === activeGenre.toLowerCase();
    return matchesQuery && matchesGenre;
  });

  const filteredArtists = artists.filter((a) => query.trim() === "" || a.displayName?.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-4 pt-6">
      <h1 className="text-3xl font-bold text-ink mb-5 tracking-tight">Search</h1>

      <div className="relative mb-4">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Artists, songs, or genres"
          className="w-full bg-panel border border-line rounded-full py-3 pl-11 pr-4 text-ink placeholder:text-muted focus:outline-none focus:border-wave-cyan" />
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode("tracks")} className={`px-4 py-1.5 rounded-full text-sm font-medium ${mode === "tracks" ? "bg-ink text-night" : "bg-panel text-muted border border-line"}`}>Tracks</button>
        <button onClick={() => setMode("artists")} className={`px-4 py-1.5 rounded-full text-sm font-medium ${mode === "artists" ? "bg-ink text-night" : "bg-panel text-muted border border-line"}`}>Artists</button>
      </div>

      {mode === "tracks" && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 -mx-4 px-4">
            {GENRES.map((genre) => (
              <button key={genre} onClick={() => setActiveGenre(genre)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${activeGenre === genre ? "bg-gradient-to-r from-wave-cyan to-wave-orange text-night" : "bg-panel text-muted border border-line"}`}>
                {genre}
              </button>
            ))}
          </div>
          {loading && <p className="text-muted">Loading tracks...</p>}
          {!loading && filteredTracks.length === 0 && <p className="text-muted">No tracks match your search.</p>}
          <div className="flex flex-col gap-2">
            {filteredTracks.map((track) => <TrackCard key={track.id} track={track} queue={filteredTracks} />)}
          </div>
        </>
      )}

      {mode === "artists" && (
        <>
          {filteredArtists.length === 0 && <p className="text-muted">No artists match your search.</p>}
          <div className="flex flex-col gap-2">
            {filteredArtists.map((artist) => (
              <div key={artist.id} onClick={() => navigate(`/artist/${artist.id}`)} className="flex items-center gap-3 bg-panel rounded-xl p-3 cursor-pointer border border-transparent active:bg-panel-2">
                <img src={artist.photoURL} alt="" className="w-12 h-12 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{artist.displayName}</p>
                  <p className="text-xs text-muted">Artist</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}