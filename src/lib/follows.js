import { doc, setDoc, deleteDoc, getDoc, getDocs, collection, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { logActivity } from "./activity";
import { createNotification } from "./notifications";

function followId(followerId, followingId) {
  return `${followerId}_${followingId}`;
}

export async function isFollowing(followerId, followingId) {
  if (!followerId) return false;
  const snap = await getDoc(doc(db, "follows", followId(followerId, followingId)));
  return snap.exists();
}

export async function toggleFollow(currentUser, targetUserId, targetUserName) {
  const ref = doc(db, "follows", followId(currentUser.uid, targetUserId));
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    return false;
  } else {
    await setDoc(ref, { followerId: currentUser.uid, followingId: targetUserId, createdAt: serverTimestamp() });
    await logActivity({ type: "follow", actor: currentUser, targetId: targetUserId, targetTitle: targetUserName });
    await createNotification(targetUserId, { type: "follow", actor: currentUser, targetId: targetUserId, targetTitle: targetUserName });
    return true;
  }
}

export async function getFollowerIds(userId) {
  const q = query(collection(db, "follows"), where("followingId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data().followerId);
}

export async function getFollowerCount(userId) {
  const q = query(collection(db, "follows"), where("followingId", "==", userId));
  const snap = await getDocs(q);
  return snap.size;
}