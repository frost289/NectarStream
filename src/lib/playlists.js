import { collection, addDoc, doc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function createPlaylist(user, title) {
  return addDoc(collection(db, "playlists"), {
    title,
    ownerId: user.uid,
    ownerName: user.displayName,
    trackIds: [],
    coverUrl: "",
    createdAt: serverTimestamp(),
  });
}

export async function getUserPlaylists(uid) {
  const q = query(collection(db, "playlists"), where("ownerId", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPlaylistById(id) {
  const snap = await getDoc(doc(db, "playlists", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addTrackToPlaylist(playlistId, track) {
  const ref = doc(db, "playlists", playlistId);
  const snap = await getDoc(ref);
  const updates = { trackIds: arrayUnion(track.id) };
  if (!snap.data()?.coverUrl) updates.coverUrl = track.coverUrl;
  await updateDoc(ref, updates);
}

export async function removeTrackFromPlaylist(playlistId, trackId) {
  await updateDoc(doc(db, "playlists", playlistId), { trackIds: arrayRemove(trackId) });
}

export async function deletePlaylist(playlistId) {
  await deleteDoc(doc(db, "playlists", playlistId));
}