import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || "local-user";

function parseDate(datumRaw: string): string | null {
  if (!datumRaw) return null;
  const cleaned = datumRaw.trim().replace(/\.$/, "");
  const [dan, mjesec, godina] = cleaned.split(".");
  if (!dan || !mjesec || !godina) return null;
  return `${godina}-${mjesec.padStart(2, "0")}-${dan.padStart(2, "0")}`;
}

type ArhiviraniObracun = {
  datum: string;
  ukupnoArtikli: number;
  ukupnoRashod: number;
  ukupnoPrihod?: number;
  neto: number;
  artikli: any[];
  rashodi: any[];
  prihodi?: any[];
  imaUlaz?: boolean;
  isAzuriran?: boolean;
};

export async function GET() {
  try {
    const { rows: obracuni } = await query(
      `SELECT o.*, u.email, u.app_name
       FROM obracuni o
       LEFT JOIN users u ON u.id = o.user_id
       WHERE o.user_id = $1
       ORDER BY o.datum ASC`,
      [DEFAULT_USER_ID]
    );

    const result = [];
    for (const o of obracuni) {
      const { rows: artikli } = await query(
        `SELECT * FROM obracun_artikli WHERE obracun_id = $1 ORDER BY id`,
        [o.id]
      );
      const { rows: rashodi } = await query(
        `SELECT * FROM obracun_rashodi WHERE obracun_id = $1 ORDER BY id`,
        [o.id]
      );
      const { rows: prihodi } = await query(
        `SELECT * FROM obracun_prihodi WHERE obracun_id = $1 ORDER BY id`,
        [o.id]
      );

      result.push({
        datum: o.datum_raw,
        ukupnoArtikli: Number(o.ukupno_artikli),
        ukupnoRashod: Number(o.ukupno_rashod),
        ukupnoPrihod: Number(o.ukupno_prihod),
        neto: Number(o.neto),
        artikli: artikli.map((a) => ({
          naziv: a.naziv,
          cijena: Number(a.cijena),
          pocetnoStanje: Number(a.pocetno_stanje),
          ulaz: Number(a.ulaz),
          ukupno: Number(a.ukupno),
          utroseno: Number(a.utroseno),
          krajnjeStanje: Number(a.krajnje_stanje),
          vrijednostKM: Number(a.vrijednost_km),
          zestokoKolicina: a.zestoko_kolicina ? Number(a.zestoko_kolicina) : undefined,
          proizvodnaCijena: a.proizvodna_cijena ? Number(a.proizvodna_cijena) : undefined,
          staroPocetnoStanje: a.staro_pocetno_stanje ? Number(a.staro_pocetno_stanje) : undefined,
          sačuvanUlaz: a.sacuvan_ulaz ? Number(a.sacuvan_ulaz) : undefined,
          isKrajnjeSet: a.is_krajnje_set,
        })),
        rashodi: rashodi.map((r) => ({ naziv: r.naziv, cijena: Number(r.cijena) })),
        prihodi: prihodi.map((p) => ({ naziv: p.naziv, cijena: Number(p.cijena) })),
        imaUlaz: o.ima_ulaz,
        isAzuriran: o.is_azuriran,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Greška u GET /api/obracuni:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: ArhiviraniObracun = await request.json();
    const datumRaw = body.datum;
    const datum = parseDate(datumRaw);
    if (!datum) {
      return NextResponse.json({ error: "Nevažeći datum" }, { status: 400 });
    }

    const ukupnoArtikli = Number(body.ukupnoArtikli || 0);
    const ukupnoRashod = Number(body.ukupnoRashod || 0);
    const ukupnoPrihod = Number(body.ukupnoPrihod || 0);
    const neto = Number(body.neto || 0);

    const { rows } = await query(
      `INSERT INTO obracuni (
         user_id, datum, datum_raw, ukupno_artikli, ukupno_rashod, ukupno_prihod, neto, ima_ulaz, is_azuriran
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (user_id, datum) DO UPDATE
         SET datum_raw = EXCLUDED.datum_raw,
             ukupno_artikli = EXCLUDED.ukupno_artikli,
             ukupno_rashod = EXCLUDED.ukupno_rashod,
             ukupno_prihod = EXCLUDED.ukupno_prihod,
             neto = EXCLUDED.neto,
             ima_ulaz = EXCLUDED.ima_ulaz,
             is_azuriran = EXCLUDED.is_azuriran
       RETURNING id;`,
      [
        DEFAULT_USER_ID,
        datum,
        datumRaw,
        ukupnoArtikli,
        ukupnoRashod,
        ukupnoPrihod,
        neto,
        body.imaUlaz || false,
        body.isAzuriran || false,
      ]
    );

    const obracunId = rows[0].id;

    await query("DELETE FROM obracun_artikli WHERE obracun_id = $1", [obracunId]);
    await query("DELETE FROM obracun_rashodi WHERE obracun_id = $1", [obracunId]);
    await query("DELETE FROM obracun_prihodi WHERE obracun_id = $1", [obracunId]);

    const artikli = Array.isArray(body.artikli) ? body.artikli : [];
    for (const a of artikli) {
      await query(
        `INSERT INTO obracun_artikli (
           obracun_id, naziv, cijena, pocetno_stanje, ulaz, ukupno,
           utroseno, krajnje_stanje, vrijednost_km,
           zestoko_kolicina, proizvodna_cijena,
           staro_pocetno_stanje, sacuvan_ulaz, is_krajnje_set
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          obracunId,
          a.naziv || "",
          Number(a.cijena || 0),
          Number(a.pocetnoStanje || 0),
          Number(a.ulaz || 0),
          Number(a.ukupno || 0),
          Number(a.utroseno || a.utrošeno || 0),
          Number(a.krajnjeStanje || 0),
          Number(a.vrijednostKM || 0),
          a.zestokoKolicina ?? null,
          a.proizvodnaCijena ?? null,
          a.staroPocetnoStanje ?? null,
          a.sačuvanUlaz ?? null,
          Boolean(a.isKrajnjeSet),
        ]
      );
    }

    const rashodi = Array.isArray(body.rashodi) ? body.rashodi : [];
    for (const r of rashodi) {
      await query(
        `INSERT INTO obracun_rashodi (obracun_id, naziv, cijena) VALUES ($1,$2,$3)`,
        [obracunId, r.naziv || "", Number(r.cijena || 0)]
      );
    }

    const prihodi = Array.isArray(body.prihodi) ? body.prihodi : [];
    for (const p of prihodi) {
      await query(
        `INSERT INTO obracun_prihodi (obracun_id, naziv, cijena) VALUES ($1,$2,$3)`,
        [obracunId, p.naziv || "", Number(p.cijena || 0)]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Greška u POST /api/obracuni:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

