import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { NextRequest, NextResponse } from "next/server";

// Logiranje za dijagnostiku
console.log("Firebase Admin Config:", {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
});

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "ID token je obavezan" }, { status: 400 });
    }

    // Verifikacija ID tokena
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    console.log("ID token verificiran za UID:", uid);

    // Kreiranje sesije
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 dana
    const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });

    return NextResponse.json({ success: true }, {
      headers: {
        "Set-Cookie": `session=${sessionCookie}; Max-Age=${expiresIn / 1000}; Path=/; HttpOnly; Secure; SameSite=Strict`,
      },
    });
  } catch (error: any) {
    console.error("Greška pri postavljanju sesije:", error);
    return NextResponse.json({ error: `Neuspješno postavljanje sesije: ${error.message}` }, { status: 500 });
  }
}