import { doc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

export async function getUserById(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, { displayName, bio, photoURL }) {
  const updates = { displayName, bio };
  if (photoURL) updates.photoURL = photoURL;
  await updateDoc(doc(db, "users", uid), updates);

  const q = query(collection(db, "tracks"), where("artistId", "==", uid));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const batch = writeBatch(db);
    snap.docs.forEach((trackDoc) => batch.update(trackDoc.ref, { artistName: displayName }));
    await batch.commit();
  }
}

export async function registerAsArtist(uid, { artistName, bio }) {
  const updates = { role: "artist" };
  if (artistName) updates.displayName = artistName;
  if (bio !== undefined) updates.bio = bio;
  await updateDoc(doc(db, "users", uid), updates);
}