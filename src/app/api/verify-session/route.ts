// src/app/api/verify-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const { sessionCookie } = await request.json();
    if (!sessionCookie) {
      return NextResponse.json({ isValid: false }, { status: 400 });
    }

    const decodedToken = await getAuth().verifySessionCookie(sessionCookie);
    return NextResponse.json({ isValid: !!decodedToken });
  } catch (error) {
    console.error("Greška pri verifikaciji session cookie-a:", error);
    return NextResponse.json({ isValid: false }, { status: 500 });
  }
}