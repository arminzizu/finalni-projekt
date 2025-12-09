-- ============================================
-- BRZI SETUP - SVE U JEDNOM
-- ============================================
-- Pokreni: sudo -u postgres psql -f scripts/quick-setup.sql

-- 1. Kreiraj korisnika
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'office_user') THEN
    CREATE USER office_user WITH ENCRYPTED PASSWORD 'Jasamkonj12_';
  END IF;
END
$$;

-- 2. Postavi lozinku
ALTER USER office_user WITH ENCRYPTED PASSWORD 'Jasamkonj12_';

-- 3. Kreiraj bazu
SELECT 'CREATE DATABASE office_app OWNER office_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'office_app')\gexec

-- 4. Daj privilegije
GRANT ALL PRIVILEGES ON DATABASE office_app TO office_user;

-- 5. Konektuj se na bazu i primijeni shemu
\c office_app

-- 6. Primijeni shemu
\i database_schema.sql

-- 7. Kreiraj admin korisnika
INSERT INTO users (id, email, display_name, app_name)
VALUES ('admin-user', 'gitara.zizu@gmail.com', 'Admin', 'Moja Aplikacija')
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      display_name = EXCLUDED.display_name,
      app_name = COALESCE(users.app_name, EXCLUDED.app_name);

-- 8. Provjeri
SELECT 'Setup završen!' as status;
SELECT id, email, display_name FROM users;

