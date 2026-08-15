import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllArtists } from "../lib/artists";
import { isFollowing, toggleFollow } from "../lib/follows";

export default function SuggestedArtists() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [followState, setFollowState] = useState({});

  useEffect(() => {
    getAllArtists().then(async (all) => {
      const others = all.filter((a) => a.id !== user?.uid).slice(0, 10);
      setArtists(others);
      const entries = await Promise.all(others.map(async (a) => [a.id, await isFollowing(user.uid, a.id)]));
      setFollowState(Object.fromEntries(entries));
    });
  }, [user]);

  const handleFollow = async (artist) => {
    const nowFollowing = await toggleFollow(user, artist.id, artist.displayName);
    setFollowState((s) => ({ ...s, [artist.id]: nowFollowing }));
  };

  if (artists.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-ink mb-3">Suggested Artists</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
        {artists.map((artist) => (
          <div key={artist.id} className="flex-shrink-0 w-20 flex flex-col items-center gap-2">
            <img src={artist.photoURL} alt="" onClick={() => navigate(`/artist/${artist.id}`)} className="w-16 h-16 rounded-full object-cover cursor-pointer" />
            <p className="truncate text-xs text-ink w-full text-center">{artist.displayName}</p>
            <button onClick={() => handleFollow(artist)} className={`text-[10px] px-2 py-1 rounded-full ${followState[artist.id] ? "border border-line text-muted" : "bg-gradient-to-r from-wave-cyan to-wave-orange text-night"}`}>
              {followState[artist.id] ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}