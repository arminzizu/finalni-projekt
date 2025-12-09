-- Seed admin korisnika u bazu
-- Pokreni: sudo -u postgres psql -d office_app -f scripts/seed-admin-user.sql

INSERT INTO users (id, email, display_name, app_name)
VALUES ('admin-user', 'gitara.zizu@gmail.com', 'Admin', 'Moja Aplikacija')
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      display_name = EXCLUDED.display_name,
      app_name = COALESCE(users.app_name, EXCLUDED.app_name);

