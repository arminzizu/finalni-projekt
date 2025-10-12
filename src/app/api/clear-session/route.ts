import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Briše sesijski kolačić
    return NextResponse.json({ success: true }, {
      headers: {
        "Set-Cookie": "session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict",
      },
    });
  } catch (error: any) {
    console.error("Greška pri brisanju sesije:", error);
    return NextResponse.json({ error: "Neuspješno brisanje sesije" }, { status: 500 });
  }
}