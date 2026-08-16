const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrate() {
  const snap = await db.collection("tracks").get();
  const batch = db.batch();
  let count = 0;

  snap.forEach((doc) => {
    if (!doc.data().status) {
      batch.update(doc.ref, { status: "approved", tier: doc.data().tier || "standard" });
      count++;
    }
  });

  if (count > 0) await batch.commit();
  console.log(`Migrated ${count} existing tracks to status: approved.`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});