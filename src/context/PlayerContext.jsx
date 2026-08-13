import { createContext, useContext, useState, useRef, useEffect } from "react";
import { incrementPlays } from "../lib/tracks";
import { logRecentlyPlayed } from "../lib/recentlyPlayed";
import { useAuth } from "./AuthContext";

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // "off" | "all" | "one"
  const audioRef = useRef(new Audio());

  const currentIndex = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : -1;

  useEffect(() => {
    const audio = audioRef.current;
    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const startTrack = (track) => {
    audioRef.current.src = track.audioUrl;
    audioRef.current.play();
    setCurrentTrack(track);
    setIsPlaying(true);
    incrementPlays(track.id).catch(() => {});
    if (user) logRecentlyPlayed(user, track).catch(() => {});
  };

  const goToNext = () => {
    if (!queue.length) return;
    if (shuffleOn) {
      if (queue.length === 1) return startTrack(queue[0]);
      let nextIdx = currentIndex;
      while (nextIdx === currentIndex) nextIdx = Math.floor(Math.random() * queue.length);
      return startTrack(queue[nextIdx]);
    }
    if (currentIndex === -1) return;
    if (currentIndex < queue.length - 1) return startTrack(queue[currentIndex + 1]);
    if (repeatMode === "all") return startTrack(queue[0]);
    setIsPlaying(false);
  };

  const goToPrevious = () => {
    if (!queue.length || currentIndex <= 0) {
      audioRef.current.currentTime = 0;
      return;
    }
    startTrack(queue[currentIndex - 1]);
  };

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      goToNext();
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, currentTrack, shuffleOn, repeatMode]);

  const playTrack = (track, list) => {
    if (currentTrack?.id === track.id && queue.some((t) => t.id === track.id)) {
      togglePlay();
      return;
    }
    setQueue(list && list.length ? list : [track]);
    startTrack(track);
  };

  const togglePlay = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  const toggleShuffle = () => setShuffleOn((s) => !s);
  const cycleRepeat = () => setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));

  const addToQueue = (track) => {
    setQueue((prev) => (prev.some((t) => t.id === track.id) ? prev : [...prev, track]));
  };

  const moveInQueue = (index, direction) => {
    setQueue((prev) => {
      const arr = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= arr.length) return arr;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const removeFromQueue = (index) => {
    setQueue((prev) => (prev[index]?.id === currentTrack?.id ? prev : prev.filter((_, i) => i !== index)));
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack, isPlaying, isExpanded, setIsExpanded, progress, duration, queue,
        shuffleOn, repeatMode, playTrack, togglePlay, seekTo, goToNext, goToPrevious,
        toggleShuffle, cycleRepeat, addToQueue, moveInQueue, removeFromQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}