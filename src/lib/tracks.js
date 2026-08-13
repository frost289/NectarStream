import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { logActivity } from "./activity";
import { createNotification } from "./notifications";
import { getFollowerIds } from "./follows";

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

  const followerIds = await getFollowerIds(artist.uid);
  await Promise.all(followerIds.map((fid) => createNotification(fid, { type: "upload", actor: artist, targetId: ref.id, targetTitle: title })));

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

export async function updateTrack(trackId, { title, genre }) {
  await updateDoc(doc(db, "tracks", trackId), { title, genre });
}

export async function deleteTrack(trackId) {
  await deleteDoc(doc(db, "tracks", trackId));
}