import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserCog } from "lucide-react";
import { getUserById } from "../lib/users";
import { isFollowing, toggleFollow, getFollowerCount } from "../lib/follows";
import { useAuth } from "../context/AuthContext";
import { useTracks } from "../context/TracksContext";
import TrackCard from "../components/TrackCard";
import EditProfileSheet from "../components/EditProfileSheet";

export default function ArtistProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { tracks: allTracks } = useTracks();
  const [artist, setArtist] = useState(null);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);

  const tracks = allTracks.filter((t) => t.artistId === id);

  const loadArtist = () => {
    Promise.all([getUserById(id), getFollowerCount(id), user ? isFollowing(user.uid, id) : Promise.resolve(false)]).then(
      ([artistData, count, isFollow]) => {
        setArtist(artistData);
        setFollowerCount(count);
        setFollowing(isFollow);
        setLoading(false);
      }
    );
  };

  useEffect(loadArtist, [id, user]);

  const handleFollow = async () => {
    if (!user) return;
    const nowFollowing = await toggleFollow(user, id, artist?.displayName);
    setFollowing(nowFollowing);
    setFollowerCount((c) => (nowFollowing ? c + 1 : c - 1));
  };

  if (loading) return <div className="p-4 pt-6 text-muted">Loading...</div>;
  if (!artist) return <div className="p-4 pt-6 text-muted">Artist not found.</div>;

  const isSelf = user?.uid === id;

  return (
    <div className="p-4 pt-6 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <img src={artist.photoURL} alt="" className="w-16 h-16 rounded-full ring-2 ring-wave-cyan/40 object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-ink">{artist.displayName}</p>
          <p className="text-sm text-muted">{followerCount} followers · {tracks.length} tracks</p>
          {artist.bio && <p className="text-sm text-muted mt-1">{artist.bio}</p>}
        </div>
        {isSelf && <button onClick={() => setEditingProfile(true)} className="text-muted"><UserCog size={20} /></button>}
      </div>

      {!isSelf && user && (
        <button onClick={handleFollow} className={`rounded-full py-3.5 font-semibold transition ${following ? "border border-line text-ink" : "bg-gradient-to-r from-wave-cyan to-wave-orange text-night"}`}>
          {following ? "Following" : "Follow"}
        </button>
      )}

      <div>
        <h2 className="text-lg font-semibold text-ink mb-3">Tracks</h2>
        {tracks.length === 0 && <p className="text-muted">No tracks yet.</p>}
        <div className="flex flex-col gap-2">
          {tracks.map((track) => <TrackCard key={track.id} track={track} queue={tracks} />)}
        </div>
      </div>

      {editingProfile && (
        <EditProfileSheet profile={artist} onClose={() => setEditingProfile(false)} onSaved={() => { setEditingProfile(false); loadArtist(); }} />
      )}
    </div>
  );
}