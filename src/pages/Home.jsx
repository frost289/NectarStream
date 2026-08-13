import { useEffect, useState } from "react";
import { getAllTracks } from "../lib/tracks";
import TrackCard from "../components/TrackCard";
import { usePlayer } from "../context/PlayerContext";

export default function Home() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    getAllTracks().then((data) => {
      setTracks(data);
      setLoading(false);
    });
  }, []);

  const featured = tracks.slice(0, 5);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-orange-400 mb-6">For You</h1>

      {loading && <p className="text-slate-400">Loading tracks...</p>}
      {!loading && tracks.length === 0 && (
        <p className="text-slate-400">No tracks yet — be the first to upload one.</p>
      )}

      {featured.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 -mx-4 px-4">
          {featured.map((track) => (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className="flex-shrink-0 w-40 cursor-pointer"
            >
              <img src={track.coverUrl} alt="" className="w-40 h-40 rounded-xl object-cover mb-2" />
              <p className="truncate font-medium text-white text-sm">{track.title}</p>
              <p className="truncate text-xs text-slate-400">{track.artistName}</p>
            </div>
          ))}
        </div>
      )}

      {tracks.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-white mb-3">All Tracks</h2>
          <div className="flex flex-col gap-2">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}