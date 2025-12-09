import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || "admin-user";

type ArtiklCijena = {
  naziv: string;
  cijena: number;
  jeZestoko: boolean;
  zestokoKolicina?: number;
  proizvodnaCijena?: number;
  nabavnaCijena: number;
  nabavnaCijenaFlase?: number;
  zapreminaFlase?: number;
  pocetnoStanje: number;
};

export async function GET() {
  try {
    // Za sada vraćamo prazan array - cjenovnik se može čuvati u bazi kasnije
    // Trenutno se koristi localStorage, ali možemo dodati tabelu ako treba
    return NextResponse.json({ cjenovnik: [] });
  } catch (err) {
    console.error("Greška u GET /api/cjenovnik:", err);
    return NextResponse.json({ cjenovnik: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cjenovnik } = body || {};

    if (!Array.isArray(cjenovnik)) {
      return NextResponse.json({ error: "cjenovnik mora biti array" }, { status: 400 });
    }

    // Za sada samo vraćamo ok - cjenovnik se može čuvati u bazi kasnije
    // Možemo dodati tabelu cjenovnik ako treba
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Greška u POST /api/cjenovnik:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

