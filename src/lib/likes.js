import { doc, setDoc, deleteDoc, getDoc, getDocs, collection, query, where, increment, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { logActivity } from "./activity";
import { createNotification } from "./notifications";

function likeId(userId, trackId) {
  return `${userId}_${trackId}`;
}

export async function isTrackLiked(userId, trackId) {
  if (!userId) return false;
  const snap = await getDoc(doc(db, "likes", likeId(userId, trackId)));
  return snap.exists();
}

export async function toggleLike(user, track) {
  const ref = doc(db, "likes", likeId(user.uid, track.id));
  const snap = await getDoc(ref);
  const trackRef = doc(db, "tracks", track.id);

  if (snap.exists()) {
    await deleteDoc(ref);
    await updateDoc(trackRef, { likesCount: increment(-1) });
    return false;
  } else {
    await setDoc(ref, { userId: user.uid, trackId: track.id, createdAt: serverTimestamp() });
    await updateDoc(trackRef, { likesCount: increment(1) });
    await logActivity({ type: "like", actor: user, targetId: track.id, targetTitle: track.title });
    await createNotification(track.artistId, { type: "like", actor: user, targetId: track.id, targetTitle: track.title });
    return true;
  }
}

export async function getUserLikedTrackIds(userId) {
  const q = query(collection(db, "likes"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().trackId);
}