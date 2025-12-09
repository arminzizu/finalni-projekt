/**
 * Export svih Firestore podataka koje koristi aplikacija.
 * Podržava strukturu:
 *   users/{uid}
 *   users/{uid}/obracuni/{datumString}
 *
 * Varijable okoline:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY  (sa literalnim \n ili pravim novim linijama)
 *
 * Pokretanje:
 *   node scripts/export-firestore.js
 *
 * Rezultat:
 *   ./firestore-export.json
 */

const fs = require("fs");
const path = require("path");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKeyRaw) {
  console.error("Nedostaju FIREBASE_* varijable okoline.");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKeyRaw.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

async function exportData() {
  const outPath = path.join(process.cwd(), "firestore-export.json");
  const result = [];

  console.log("Čitam kolekciju users ...");
  const usersSnap = await db.collection("users").get();

  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data() || {};

    // Učitaj subkolekciju obracuni
    const obracuniSnap = await db
      .collection("users")
      .doc(userDoc.id)
      .collection("obracuni")
      .get();

    const obracuni = obracuniSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    result.push({
      userId: userDoc.id,
      ...userData,
      obracuni,
    });
  }

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`Export završen -> ${outPath}`);
}

exportData().catch((err) => {
  console.error("Greška pri exportu:", err);
  process.exit(1);
});

