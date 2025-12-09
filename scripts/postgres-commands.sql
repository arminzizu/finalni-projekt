-- ============================================
-- POSTGRES SETUP KOMANDE ZA OFFICE_APP
-- ============================================
-- Pokreni ove komande u psql:
--   sudo -u postgres psql
--   ili
--   sudo -u postgres psql -d office_app

-- ============================================
-- 1. KREIRANJE KORISNIKA
-- ============================================
-- Kreiraj korisnika (ako ne postoji)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'office_user') THEN
    CREATE USER office_user WITH ENCRYPTED PASSWORD 'Jasamkonj12_';
    RAISE NOTICE 'Korisnik office_user kreiran';
  ELSE
    RAISE NOTICE 'Korisnik office_user već postoji';
  END IF;
END
$$;

-- Postavi/izmijeni lozinku
ALTER USER office_user WITH ENCRYPTED PASSWORD 'Jasamkonj12_';

-- ============================================
-- 2. KREIRANJE BAZE
-- ============================================
-- Kreiraj bazu (ako ne postoji)
SELECT 'CREATE DATABASE office_app OWNER office_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'office_app')\gexec

-- Daj privilegije
GRANT ALL PRIVILEGES ON DATABASE office_app TO office_user;

-- ============================================
-- 3. PRIMJENA SHEME (nakon što se konektuješ na bazu)
-- ============================================
-- \c office_app
-- \i database_schema.sql

-- ============================================
-- 4. KREIRANJE ADMIN KORISNIKA
-- ============================================
-- \c office_app
INSERT INTO users (id, email, display_name, app_name)
VALUES ('admin-user', 'gitara.zizu@gmail.com', 'Admin', 'Moja Aplikacija')
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      display_name = EXCLUDED.display_name,
      app_name = COALESCE(users.app_name, EXCLUDED.app_name);

-- ============================================
-- 5. PROVJERA
-- ============================================
-- Provjeri korisnike
SELECT id, email, display_name, app_name FROM users;

-- Provjeri tablice
\dt

-- Provjeri privilegije
\du office_user

