const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const GENRES = ["Afrobeats", "Hip Hop", "Amapiano", "R&B", "Deep House"];
const ARTIST_NAMES = [
  "Kelvin Waves", "Zola Beats", "Mira Sound", "The Night Runners", "Naledi",
  "Kojo Fresh", "Amara Rhythm", "DJ Chombe", "Lulu Skye", "Blvck Sun",
];
const TRACK_TITLES = [
  "Midnight Drive", "Sunrise Over Blantyre", "Lilongwe Nights", "Golden Hour",
  "Street Anthem", "Dust and Gold", "City Lights", "Slow Burn", "Wavelength",
  "Homebound", "Neon Sky", "Low Tide", "First Light", "Echoes", "Afterglow",
  "Turn It Up", "Rewind", "Chasing Sound", "Still Water", "Take Flight",
];

// Freely licensed demo audio, made publicly available for exactly this purpose
const SAMPLE_AUDIO = Array.from({ length: 16 }, (_, i) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`
);

async function seed(count = 20) {
  for (let i = 0; i < count; i++) {
    const artistName = ARTIST_NAMES[i % ARTIST_NAMES.length];
    const artistId = `seed-artist-${i % ARTIST_NAMES.length}`;
    const title = TRACK_TITLES[i % TRACK_TITLES.length];
    const genre = GENRES[i % GENRES.length];
    const audioUrl = SAMPLE_AUDIO[i % SAMPLE_AUDIO.length];
    const coverUrl = `https://picsum.photos/seed/streetwave-${i}/400/400`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(artistName)}`;

    await db.collection("users").doc(artistId).set(
      { uid: artistId, displayName: artistName, photoURL: avatarUrl, role: "artist", bio: "Independent artist on StreetWave.", isSeed: true },
      { merge: true }
    );

    await db.collection("tracks").add({
      title, genre, audioUrl, coverUrl,
      artistId, artistName,
      plays: Math.floor(Math.random() * 500),
      likesCount: 0,
      isSeed: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "approved",
      tier: "standard",
    });

    console.log(`Seeded: ${title} — ${artistName}`);
  }
  console.log("Done.");
  process.exit(0);
}

seed(20).catch((err) => {
  console.error(err);
  process.exit(1);
});