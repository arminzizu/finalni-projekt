-- Daj privilegije office_user korisniku
-- Pokreni: sudo -u postgres psql -d office_app -f scripts/fix-permissions.sql

-- Daj sve privilegije na bazu
GRANT ALL PRIVILEGES ON DATABASE office_app TO office_user;

-- Konektuj se na bazu
\c office_app

-- Daj privilegije na sve tablice
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO office_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO office_user;

-- Daj privilegije na buduće tablice
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO office_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO office_user;

-- Provjeri privilegije
\du office_user

