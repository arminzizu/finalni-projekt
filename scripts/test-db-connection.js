/**
 * Test database konekcije
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Učitaj .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL nije postavljen!");
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function testConnection() {
  console.log("🧪 Testiranje database konekcije...\n");
  
  try {
    // Test 1: Osnovna konekcija
    console.log("1️⃣ Testiranje konekcije...");
    const client = await pool.connect();
    console.log("✅ Konekcija uspješna!");
    client.release();

    // Test 2: Provjera users tablice
    console.log("\n2️⃣ Provjera users tablice...");
    const result = await pool.query("SELECT COUNT(*) FROM users");
    console.log(`✅ Users tabela postoji, ima ${result.rows[0].count} korisnika`);

    // Test 3: Provjera admin usera
    console.log("\n3️⃣ Provjera admin usera...");
    const adminResult = await pool.query("SELECT * FROM users WHERE id = 'admin-user'");
    if (adminResult.rows.length > 0) {
      console.log("✅ Admin user postoji:", adminResult.rows[0]);
    } else {
      console.log("⚠️ Admin user ne postoji, treba ga kreirati");
    }

    // Test 4: INSERT test
    console.log("\n4️⃣ Test INSERT/UPDATE...");
    const insertResult = await pool.query(
      `INSERT INTO users (id, email, display_name, app_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE
         SET email = EXCLUDED.email
       RETURNING id, email`,
      ['admin-user', 'gitara.zizu@gmail.com', 'Admin', 'Moja Aplikacija']
    );
    console.log("✅ INSERT/UPDATE uspješan:", insertResult.rows[0]);

    console.log("\n✅ Svi testovi prošli!");
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ GREŠKA:", err.message);
    console.error("Stack:", err.stack);
    await pool.end();
    process.exit(1);
  }
}

testConnection();

