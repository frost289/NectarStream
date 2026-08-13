import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function logActivity({ type, actor, targetId, targetTitle }) {
  return addDoc(collection(db, "activity"), {
    type,
    actorId: actor.uid,
    actorName: actor.displayName,
    actorPhoto: actor.photoURL,
    targetId,
    targetTitle,
    createdAt: serverTimestamp(),
  });
}

export async function getRecentActivity(count = 15) {
  const q = query(collection(db, "activity"), orderBy("createdAt", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}