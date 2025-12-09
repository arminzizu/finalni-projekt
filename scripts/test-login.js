/**
 * Test login API endpointa
 * Pokreni: node scripts/test-login.js
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "gitara.zizu@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "promijeni_lozinku";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function testLogin() {
  console.log("🧪 Testiranje login API-ja...\n");
  console.log(`📧 Email: ${ADMIN_EMAIL}`);
  console.log(`🔑 Password: ${ADMIN_PASSWORD ? "***" : "NEDEFINISAN"}`);
  console.log(`🌐 URL: ${BASE_URL}/api/login\n`);

  try {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    const data = await response.json();

    if (response.ok && data.ok) {
      console.log("✅ LOGIN USPJEŠAN!");
      console.log("📊 Odgovor:", JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log("❌ LOGIN NEUSPJEŠAN!");
      console.log("📊 Status:", response.status);
      console.log("📊 Odgovor:", JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.error("❌ GREŠKA:", error.message);
    console.log("\n💡 Provjeri:");
    console.log("   1. Da li je app pokrenut (npm run dev)");
    console.log("   2. Da li je .env.local postavljen");
    console.log("   3. Da li je DATABASE_URL ispravan");
    return false;
  }
}

testLogin().then((success) => {
  process.exit(success ? 0 : 1);
});

