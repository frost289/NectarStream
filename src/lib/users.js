import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function getUserById(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}