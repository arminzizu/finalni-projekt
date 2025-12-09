-- Postgres shema za migraciju Firebase podataka na server
-- Kreiraj bazu i korisnika prije ovoga:
--   sudo -u postgres createuser office_user --pwprompt
--   sudo -u postgres createdb office_app -O office_user
-- Pokreni: sudo -u postgres psql -d office_app -f database_schema.sql

BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                  -- Firebase UID
    email TEXT,
    display_name TEXT,
    app_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS obracuni (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    datum DATE NOT NULL,
    datum_raw TEXT NOT NULL,              -- originalni string dd.mm.yyyy.
    ukupno_artikli NUMERIC(12,2) NOT NULL DEFAULT 0,
    ukupno_rashod NUMERIC(12,2) NOT NULL DEFAULT 0,
    ukupno_prihod NUMERIC(12,2) NOT NULL DEFAULT 0,
    neto NUMERIC(12,2) NOT NULL DEFAULT 0,
    ima_ulaz BOOLEAN DEFAULT FALSE,
    is_azuriran BOOLEAN DEFAULT FALSE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, datum)
);

CREATE INDEX IF NOT EXISTS idx_obracuni_user_datum ON obracuni(user_id, datum DESC);

CREATE TABLE IF NOT EXISTS obracun_artikli (
    id SERIAL PRIMARY KEY,
    obracun_id INTEGER NOT NULL REFERENCES obracuni(id) ON DELETE CASCADE,
    naziv TEXT NOT NULL,
    cijena NUMERIC(12,2) NOT NULL DEFAULT 0,
    pocetno_stanje NUMERIC(12,2) NOT NULL DEFAULT 0,
    ulaz NUMERIC(12,2) NOT NULL DEFAULT 0,
    ukupno NUMERIC(12,2) NOT NULL DEFAULT 0,
    utroseno NUMERIC(12,2) NOT NULL DEFAULT 0,
    krajnje_stanje NUMERIC(12,2) NOT NULL DEFAULT 0,
    vrijednost_km NUMERIC(12,2) NOT NULL DEFAULT 0,
    zestoko_kolicina NUMERIC(12,4),
    proizvodna_cijena NUMERIC(12,4),
    staro_pocetno_stanje NUMERIC(12,2),
    sacuvan_ulaz NUMERIC(12,2),
    is_krajnje_set BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_artikli_obracun ON obracun_artikli(obracun_id);

CREATE TABLE IF NOT EXISTS obracun_rashodi (
    id SERIAL PRIMARY KEY,
    obracun_id INTEGER NOT NULL REFERENCES obracuni(id) ON DELETE CASCADE,
    naziv TEXT NOT NULL,
    cijena NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS obracun_prihodi (
    id SERIAL PRIMARY KEY,
    obracun_id INTEGER NOT NULL REFERENCES obracuni(id) ON DELETE CASCADE,
    naziv TEXT NOT NULL,
    cijena NUMERIC(12,2) NOT NULL DEFAULT 0
);

COMMIT;

