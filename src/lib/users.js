import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function getUserById(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, { displayName, bio, photoURL }) {
  const updates = { displayName, bio };
  if (photoURL) updates.photoURL = photoURL;
  await updateDoc(doc(db, "users", uid), updates);
}