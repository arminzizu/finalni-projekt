// src/lib/firebase-admin.ts
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert, getApps } from "firebase-admin/app";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const getSessionCookie = async (cookie: string) => {
  try {
    const decodedToken = await getAuth().verifySessionCookie(cookie);
    return decodedToken;
  } catch (error) {
    console.error("Greška verifikacije session cookie-a:", error);
    return null;
  }
};

export const auth = getAuth();