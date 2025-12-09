/**
 * Uvoz Firestore exporta (firestore-export.json) u Postgres shemu iz database_schema.sql.
 *
 * Priprema:
 *   1) npm install pg
 *   2) Postavi DATABASE_URL (ili prilagodi default ispod).
 *   3) Napravi export: node scripts/export-firestore.js  (dobiješ firestore-export.json)
 *
 * Pokretanje:
 *   DATABASE_URL=postgresql://office_user:Jasamkonj12_@localhost:5432/office_app node scripts/import-firestore-to-postgres.js
 *
 * Napomena:
 * - Očekuje se da JSON sadrži:
 *   [
 *     {
 *       userId: "...",
 *       email?: "...",
 *       displayName?: "...",
 *       appName?: "...",
 *       obracuni: [
 *         {
 *           id: "dd.mm.yyyy." | "...",
 *           datum?: "dd.mm.yyyy.",
 *           ukupnoArtikli, ukupnoRashod, ukupnoPrihod, neto,
 *           artikli: [{ naziv, cijena, pocetnoStanje, ulaz, ukupno, utroseno, krajnjeStanje, vrijednostKM, ... }],
 *           rashodi: [{ naziv, cijena }],
 *           prihodi: [{ naziv, cijena }],
 *           imaUlaz, isAzuriran, savedAt
 *         }
 *       ]
 *     }
 *   ]
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://office_user:Jasamkonj12_@localhost:5432/office_app";

const INPUT_PATH =
  process.env.FIRESTORE_EXPORT_PATH ||
  path.join(process.cwd(), "firestore-export.json");

function parseExport() {
  if (!fs.existsSync(INPUT_PATH)) {
    throw new Error(`Nema datoteke za uvoz: ${INPUT_PATH}`);
  }
  const raw = fs.readFileSync(INPUT_PATH, "utf8");
  return JSON.parse(raw);
}

function parseDatum(datumString) {
  if (!datumString) return null;
  // očekujemo "dd.mm.yyyy." ili "dd.mm.yyyy"
  const cleaned = datumString.trim().replace(/\.$/, "");
  const [dan, mjesec, godina] = cleaned.split(".");
  if (!dan || !mjesec || !godina) return null;
  return `${godina}-${mjesec.padStart(2, "0")}-${dan.padStart(2, "0")}`;
}

async function main() {
  const data = parseExport();
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    await client.query("BEGIN");

    for (const user of data) {
      const userId = user.userId;
      if (!userId) {
        console.warn("Preskačem zapis bez userId:", user);
        continue;
      }

      const email = user.email || user.emailAddress || null;
      const displayName = user.displayName || null;
      const appName = user.appName || null;

      await client.query(
        `
        INSERT INTO users (id, email, display_name, app_name)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE
          SET email = EXCLUDED.email,
              display_name = EXCLUDED.display_name,
              app_name = EXCLUDED.app_name;
        `,
        [userId, email, displayName, appName]
      );

      const obracuni = Array.isArray(user.obracuni) ? user.obracuni : [];
      for (const obracun of obracuni) {
        const datumRaw = obracun.datum || obracun.id;
        const datum = parseDatum(datumRaw);
        if (!datum) {
          console.warn(`Preskačem obracun bez valjanog datuma za user ${userId}:`, datumRaw);
          continue;
        }

        const ukupnoArtikli = Number(obracun.ukupnoArtikli || obracun.ukupno_artikli || 0);
        const ukupnoRashod = Number(obracun.ukupnoRashod || obracun.ukupno_rashod || 0);
        const ukupnoPrihod = Number(obracun.ukupnoPrihod || obracun.ukupno_prihod || 0);
        const neto = Number(obracun.neto || 0);
        const imaUlaz = Boolean(obracun.imaUlaz);
        const isAzuriran = Boolean(obracun.isAzuriran);

        const { rows } = await client.query(
          `
          INSERT INTO obracuni (
            user_id, datum, datum_raw,
            ukupno_artikli, ukupno_rashod, ukupno_prihod, neto,
            ima_ulaz, is_azuriran, saved_at
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, COALESCE($10, NOW()))
          ON CONFLICT (user_id, datum) DO UPDATE
            SET datum_raw = EXCLUDED.datum_raw,
                ukupno_artikli = EXCLUDED.ukupno_artikli,
                ukupno_rashod = EXCLUDED.ukupno_rashod,
                ukupno_prihod = EXCLUDED.ukupno_prihod,
                neto = EXCLUDED.neto,
                ima_ulaz = EXCLUDED.ima_ulaz,
                is_azuriran = EXCLUDED.is_azuriran,
                saved_at = EXCLUDED.saved_at
          RETURNING id;
          `,
          [
            userId,
            datum,
            datumRaw || datum,
            ukupnoArtikli,
            ukupnoRashod,
            ukupnoPrihod,
            neto,
            imaUlaz,
            isAzuriran,
            obracun.savedAt || null,
          ]
        );

        const obracunId = rows[0].id;

        // Očisti postojeće stavke prije ponovnog unosa (idempotentno po (user, datum))
        await client.query("DELETE FROM obracun_artikli WHERE obracun_id = $1", [obracunId]);
        await client.query("DELETE FROM obracun_rashodi WHERE obracun_id = $1", [obracunId]);
        await client.query("DELETE FROM obracun_prihodi WHERE obracun_id = $1", [obracunId]);

        const artikli = Array.isArray(obracun.artikli) ? obracun.artikli : [];
        for (const a of artikli) {
          await client.query(
            `
            INSERT INTO obracun_artikli (
              obracun_id, naziv, cijena, pocetno_stanje, ulaz, ukupno,
              utroseno, krajnje_stanje, vrijednost_km,
              zestoko_kolicina, proizvodna_cijena,
              staro_pocetno_stanje, sacuvan_ulaz, is_krajnje_set
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14);
            `,
            [
              obracunId,
              a.naziv || "",
              Number(a.cijena || 0),
              Number(a.pocetnoStanje ?? a.pocetno_stanje ?? 0),
              Number(a.ulaz || 0),
              Number(a.ukupno || 0),
              Number(a.utroseno ?? a.utrošeno ?? 0),
              Number(a.krajnjeStanje ?? a.krajnje_stanje ?? 0),
              Number(a.vrijednostKM ?? a.vrijednost_km ?? 0),
              a.zestokoKolicina ?? a.zestoko_kolicina ?? null,
              a.proizvodnaCijena ?? a.proizvodna_cijena ?? null,
              a.staroPocetnoStanje ?? a.staro_pocetno_stanje ?? null,
              a.sačuvanUlaz ?? a.sacuvan_ulaz ?? null,
              Boolean(a.isKrajnjeSet),
            ]
          );
        }

        const rashodi = Array.isArray(obracun.rashodi) ? obracun.rashodi : [];
        for (const r of rashodi) {
          await client.query(
            `INSERT INTO obracun_rashodi (obracun_id, naziv, cijena) VALUES ($1,$2,$3);`,
            [obracunId, r.naziv || "", Number(r.cijena || 0)]
          );
        }

        const prihodi = Array.isArray(obracun.prihodi) ? obracun.prihodi : [];
        for (const p of prihodi) {
          await client.query(
            `INSERT INTO obracun_prihodi (obracun_id, naziv, cijena) VALUES ($1,$2,$3);`,
            [obracunId, p.naziv || "", Number(p.cijena || 0)]
          );
        }
      }
    }

    await client.query("COMMIT");
    console.log("Uvoz završen.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Greška pri uvozu:", err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

