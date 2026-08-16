import { createContext, useContext, useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const TracksContext = createContext();

export function TracksProvider({ children }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "tracks"), where("status", "==", "approved"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTracks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return <TracksContext.Provider value={{ tracks, loading }}>{children}</TracksContext.Provider>;
}

export function useTracks() {
  return useContext(TracksContext);
}