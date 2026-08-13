import { doc, setDoc, getDocs, collection, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function logRecentlyPlayed(user, track) {
  const ref = doc(db, "users", user.uid, "recentlyPlayed", track.id);
  await setDoc(ref, {
    trackId: track.id,
    title: track.title,
    coverUrl: track.coverUrl,
    artistName: track.artistName,
    artistId: track.artistId,
    playedAt: serverTimestamp(),
  });
}

export async function getRecentlyPlayed(uid, count = 10) {
  const q = query(collection(db, "users", uid, "recentlyPlayed"), orderBy("playedAt", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}