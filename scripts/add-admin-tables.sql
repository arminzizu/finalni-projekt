-- Dodaj tabele i kolone potrebne za admin funkcionalnost
-- Pokreni: sudo -u postgres psql -d office_app -f scripts/add-admin-tables.sql

BEGIN;

-- Dodaj kolone u users tabelu ako ne postoje
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS ime_korisnika TEXT,
  ADD COLUMN IF NOT EXISTS broj_telefona TEXT,
  ADD COLUMN IF NOT EXISTS lokacija TEXT,
  ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT FALSE;

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

COMMIT;

