/**
 * Test login sa default lozinkom
 */

const BASE_URL = "http://localhost:3000";

async function testLogin(email, password) {
  console.log(`\n🧪 Testiranje: ${email} / ${password ? "***" : "empty"}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok && data.ok) {
      console.log("✅ USPJEH!");
      console.log("📊 Odgovor:", JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log(`❌ Status: ${response.status}, Error: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Greška:", error.message);
    return false;
  }
}

async function main() {
  console.log("🧪 Testiranje različitih kombinacija...\n");
  
  // Test 1: Default lozinka
  await testLogin("gitara.zizu@gmail.com", "promijeni_lozinku");
  
  // Test 2: Prazna lozinka
  await testLogin("gitara.zizu@gmail.com", "");
  
  // Test 3: Pogrešna lozinka
  await testLogin("gitara.zizu@gmail.com", "pogresna");
}

main();

