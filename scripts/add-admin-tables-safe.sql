-- Dodaj tabele i kolone potrebne za admin funkcionalnost
-- Pokreni kao postgres superuser: sudo -u postgres psql -d office_app -f scripts/add-admin-tables-safe.sql

BEGIN;

-- Dodaj kolone u users tabelu ako ne postoje
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='ime_korisnika') THEN
        ALTER TABLE users ADD COLUMN ime_korisnika TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='broj_telefona') THEN
        ALTER TABLE users ADD COLUMN broj_telefona TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='lokacija') THEN
        ALTER TABLE users ADD COLUMN lokacija TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_sign_in') THEN
        ALTER TABLE users ADD COLUMN last_sign_in TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_owner') THEN
        ALTER TABLE users ADD COLUMN is_owner BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Kreiraj subscription tabelu
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT FALSE,
    monthly_price NUMERIC(12,2) DEFAULT 12,
    last_payment_date TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    grace_end_date TIMESTAMPTZ,
    trial_end_date TIMESTAMPTZ,
    payment_pending_verification BOOLEAN DEFAULT FALSE,
    payment_requested_amount NUMERIC(12,2),
    payment_requested_months INTEGER,
    payment_reference_number TEXT,
    payment_requested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

-- Kreiraj payment_history tabelu
CREATE TABLE IF NOT EXISTS payment_history (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    note TEXT,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_subscription ON payment_history(subscription_id);

-- Kreiraj devices tabelu (ako ne postoji)
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_name TEXT,
    role TEXT DEFAULT 'korisnik',
    status TEXT DEFAULT 'pending',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_devices_user ON devices(user_id);

-- Daj dozvole office_user-u
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO office_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO office_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO office_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO office_user;

COMMIT;

