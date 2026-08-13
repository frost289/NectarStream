import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { logActivity } from "./activity";

export async function createTrack({ title, genre, audioUrl, coverUrl, artist }) {
  const ref = await addDoc(collection(db, "tracks"), {
    title,
    genre,
    audioUrl,
    coverUrl,
    artistId: artist.uid,
    artistName: artist.displayName,
    plays: 0,
    likesCount: 0,
    createdAt: serverTimestamp(),
  });
  await logActivity({ type: "upload", actor: artist, targetId: ref.id, targetTitle: title });
  return ref;
}

export async function getAllTracks() {
  const q = query(collection(db, "tracks"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getUserTracks(uid) {
  const q = query(collection(db, "tracks"), where("artistId", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function incrementPlays(trackId) {
  const ref = doc(db, "tracks", trackId);
  await updateDoc(ref, { plays: increment(1) });
}