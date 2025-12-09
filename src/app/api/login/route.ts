import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "gitara.zizu@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "promijeni_lozinku";
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || "admin-user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};
    if (!email || !password) {
      return NextResponse.json({ error: "Nedostaju email ili lozinka" }, { status: 400 });
    }

    // Provjeri admin kredencijale
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      try {
        // Provjeri/kreiraj user u bazi
        const { rows } = await query(
          `INSERT INTO users (id, email, display_name, app_name)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE
             SET email = EXCLUDED.email,
                 display_name = COALESCE(users.display_name, EXCLUDED.display_name)
           RETURNING id, email, display_name, app_name`,
          [DEFAULT_USER_ID, email, "Admin", "Moja Aplikacija"]
        );

        return NextResponse.json({
          ok: true,
          userId: rows[0].id,
          email: rows[0].email,
          displayName: rows[0].display_name,
          appName: rows[0].app_name,
        });
      } catch (dbError: any) {
        console.error("Database error:", dbError);
        // Ako baza ne radi, vrati uspješan login ali bez baze (fallback)
        return NextResponse.json({
          ok: true,
          userId: DEFAULT_USER_ID,
          email: email,
          displayName: "Admin",
          appName: "Moja Aplikacija",
          warning: "Database nije dostupan, koristi se fallback",
        });
      }
    }

    return NextResponse.json({ error: "Neispravni kredencijali" }, { status: 401 });
  } catch (err) {
    console.error("Greška u /api/login:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

