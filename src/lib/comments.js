import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { logActivity } from "./activity";

export async function addComment(track, user, text) {
  await addDoc(collection(db, "comments"), {
    trackId: track.id,
    userId: user.uid,
    userName: user.displayName,
    userPhoto: user.photoURL,
    text,
    createdAt: serverTimestamp(),
  });
  await logActivity({ type: "comment", actor: user, targetId: track.id, targetTitle: track.title });
}

export async function getComments(trackId) {
  const q = query(collection(db, "comments"), where("trackId", "==", trackId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}