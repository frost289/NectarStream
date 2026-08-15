import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export async function getAllArtists() {
  const q = query(collection(db, "users"), where("role", "==", "artist"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}