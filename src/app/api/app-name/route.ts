import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || "admin-user";

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT app_name FROM users WHERE id = $1`,
      [DEFAULT_USER_ID]
    );

    if (rows.length === 0) {
      return NextResponse.json({ appName: "Moja Aplikacija" });
    }

    return NextResponse.json({ appName: rows[0].app_name || "Moja Aplikacija" });
  } catch (err) {
    console.error("Greška u GET /api/app-name:", err);
    return NextResponse.json({ appName: "Moja Aplikacija" });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appName } = body || {};

    if (!appName || typeof appName !== "string") {
      return NextResponse.json({ error: "appName je obavezan" }, { status: 400 });
    }

    await query(
      `UPDATE users SET app_name = $1 WHERE id = $2`,
      [appName.trim(), DEFAULT_USER_ID]
    );

    return NextResponse.json({ ok: true, appName: appName.trim() });
  } catch (err) {
    console.error("Greška u POST /api/app-name:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

