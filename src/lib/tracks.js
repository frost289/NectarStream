import { collection, addDoc, doc, updateDoc, deleteDoc, increment, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { createNotification } from "./notifications";
import { getFollowerIds } from "./follows";
import { getUserById } from "./users";

export async function createTrack({ title, genre, audioUrl, coverUrl, artist }) {
  return addDoc(collection(db, "tracks"), {
    title,
    genre,
    audioUrl,
    coverUrl,
    artistId: artist.uid,
    artistName: artist.displayName,
    plays: 0,
    likesCount: 0,
    commentsCount: 0,
    status: "pending",
    tier: "standard",
    createdAt: serverTimestamp(),
  });
}

export async function incrementPlays(trackId) {
  await updateDoc(doc(db, "tracks", trackId), { plays: increment(1) });
}

export async function updateTrack(trackId, { title, genre }) {
  await updateDoc(doc(db, "tracks", trackId), { title, genre });
}

export async function deleteTrack(trackId) {
  await deleteDoc(doc(db, "tracks", trackId));
}

export async function approveTrack(track, adminUser, tier = "standard") {
  await updateDoc(doc(db, "tracks", track.id), { status: "approved", tier });

  const followerIds = await getFollowerIds(track.artistId);
  const artistProfile = await getUserById(track.artistId);
  const artistActor = { uid: track.artistId, displayName: track.artistName, photoURL: artistProfile?.photoURL };
  await Promise.all(followerIds.map((fid) => createNotification(fid, { type: "upload", actor: artistActor, targetId: track.id, targetTitle: track.title })));

  await createNotification(track.artistId, { type: "approved", actor: adminUser, targetId: track.id, targetTitle: track.title });
}

export async function rejectTrack(track, adminUser) {
  await updateDoc(doc(db, "tracks", track.id), { status: "rejected" });
  await createNotification(track.artistId, { type: "rejected", actor: adminUser, targetId: track.id, targetTitle: track.title });
}

export async function setTrackTier(trackId, tier) {
  await updateDoc(doc(db, "tracks", trackId), { tier });
}

export function subscribeToUserTracks(uid, callback) {
  const q = query(collection(db, "tracks"), where("artistId", "==", uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export function subscribeToPendingTracks(callback) {
  const q = query(collection(db, "tracks"), where("status", "==", "pending"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export function subscribeToAllTracksAdmin(callback) {
  const q = query(collection(db, "tracks"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}