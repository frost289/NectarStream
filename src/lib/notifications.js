import { collection, addDoc, doc, updateDoc, getDocs, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function createNotification(recipientId, { type, actor, targetId, targetTitle }) {
  if (recipientId === actor.uid) return;
  await addDoc(collection(db, "users", recipientId, "notifications"), {
    type,
    actorId: actor.uid,
    actorName: actor.displayName,
    actorPhoto: actor.photoURL,
    targetId,
    targetTitle,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function getNotifications(uid, count = 30) {
  const q = query(collection(db, "users", uid, "notifications"), orderBy("createdAt", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function markAllRead(uid, notifications) {
  const unread = notifications.filter((n) => !n.read);
  await Promise.all(unread.map((n) => updateDoc(doc(db, "users", uid, "notifications", n.id), { read: true })));
}