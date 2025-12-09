import { NextResponse } from "next/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "gitara.zizu@gmail.com";

export async function GET(request: Request) {
  try {
    // Provjeri email iz localStorage (frontend će poslati)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ isAdmin: false, error: "Email nije priložen" }, { status: 400 });
    }

    const isAdmin = email === ADMIN_EMAIL;

    return NextResponse.json({ isAdmin });
  } catch (err) {
    console.error("Greška u /api/admin/check:", err);
    return NextResponse.json({ isAdmin: false, error: "Server error" }, { status: 500 });
  }
}

