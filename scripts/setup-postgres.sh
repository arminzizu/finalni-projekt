#!/bin/bash
# Setup Postgres baza i korisnik za office_app
# Pokreni: bash scripts/setup-postgres.sh

echo "🔧 Postavljanje Postgres baze..."

# Kreiraj korisnika (ako ne postoji)
echo "1️⃣ Kreiranje korisnika office_user..."
sudo -u postgres psql <<EOF
-- Kreiraj korisnika ako ne postoji
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'office_user') THEN
    CREATE USER office_user WITH ENCRYPTED PASSWORD 'Jasamkonj12_';
    RAISE NOTICE 'Korisnik office_user kreiran';
  ELSE
    RAISE NOTICE 'Korisnik office_user već postoji';
  END IF;
END
\$\$;

-- Postavi lozinku (ažuriraj ako postoji)
ALTER USER office_user WITH ENCRYPTED PASSWORD 'Jasamkonj12_';

-- Kreiraj bazu ako ne postoji
SELECT 'CREATE DATABASE office_app OWNER office_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'office_app')\gexec

-- Daj sve privilegije
GRANT ALL PRIVILEGES ON DATABASE office_app TO office_user;
EOF

echo "✅ Korisnik i baza kreirani!"

# Primijeni shemu
echo "2️⃣ Primjenjivanje database sheme..."
sudo -u postgres psql -d office_app -f database_schema.sql

echo "3️⃣ Kreiranje admin korisnika..."
sudo -u postgres psql -d office_app -f scripts/seed-admin-user.sql

echo "✅ Postgres setup završen!"
echo ""
echo "📝 Provjeri .env.local:"
echo "   DATABASE_URL=postgresql://office_user:Jasamkonj12_@localhost:5432/office_app"

