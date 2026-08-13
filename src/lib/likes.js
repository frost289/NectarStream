import { doc, setDoc, deleteDoc, getDoc, getDocs, collection, query, where, increment, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

function likeId(userId, trackId) {
  return `${userId}_${trackId}`;
}

export async function isTrackLiked(userId, trackId) {
  if (!userId) return false;
  const snap = await getDoc(doc(db, "likes", likeId(userId, trackId)));
  return snap.exists();
}

export async function toggleLike(userId, track) {
  const ref = doc(db, "likes", likeId(userId, track.id));
  const snap = await getDoc(ref);
  const trackRef = doc(db, "tracks", track.id);

  if (snap.exists()) {
    await deleteDoc(ref);
    await updateDoc(trackRef, { likesCount: increment(-1) });
    return false;
  } else {
    await setDoc(ref, { userId, trackId: track.id, createdAt: serverTimestamp() });
    await updateDoc(trackRef, { likesCount: increment(1) });
    return true;
  }
}

export async function getUserLikedTracks(userId) {
  const q = query(collection(db, "likes"), where("userId", "==", userId));
  const snap = await getDocs(q);
  const trackIds = snap.docs.map((d) => d.data().trackId);
  const trackDocs = await Promise.all(trackIds.map((id) => getDoc(doc(db, "tracks", id))));
  return trackDocs.filter((d) => d.exists()).map((d) => ({ id: d.id, ...d.data() }));
}