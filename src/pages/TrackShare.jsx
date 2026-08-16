import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTracks } from "../context/TracksContext";
import { usePlayer } from "../context/PlayerContext";

export default function TrackShare() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tracks, loading } = useTracks();
  const { playTrack, setIsExpanded } = usePlayer();

  useEffect(() => {
    if (loading) return;
    const track = tracks.find((t) => t.id === id);
    if (track) {
      playTrack(track, [track]);
      setIsExpanded(true);
    }
    navigate("/", { replace: true });
  }, [loading, tracks, id]);

  return <div className="p-4 pt-6 text-muted">Loading track...</div>;
}