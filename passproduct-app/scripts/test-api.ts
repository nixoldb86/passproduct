/**
 * Script de pruebas para verificar las APIs HTTP
 * Ejecutar con: npx tsx scripts/test-api.ts
 * Nota: Requiere que el servidor esté corriendo en localhost:3000
 */

const BASE_URL = "http://localhost:3000";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  data?: unknown;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<unknown>) {
  try {
    const data = await fn();
    results.push({ name, passed: true, data });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: String(error) });
    console.log(`❌ ${name}: ${error}`);
  }
}

async function fetchJSON(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type");
  
  if (!contentType?.includes("application/json")) {
    throw new Error(`Expected JSON but got ${contentType} (status: ${response.status})`);
  }
  
  const data = await response.json();
  return { status: response.status, data };
}

async function runTests() {
  console.log("\n🧪 Iniciando tests de APIs HTTP...\n");
  console.log(`📡 Base URL: ${BASE_URL}\n`);
  console.log("=".repeat(60) + "\n");

  // Test 1: API de categorías (pública)
  await test("GET /api/db/categories - Listar categorías", async () => {
    const { status, data } = await fetchJSON(`${BASE_URL}/api/db/categories`);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!data.success) throw new Error(data.error || "No success");
    if (!Array.isArray(data.categories)) throw new Error("categories no es un array");
    return `${data.categories.length} categorías`;
  });

  // Test 2: API de listings (pública)
  await test("GET /api/db/listings - Listar listings", async () => {
    const { status, data } = await fetchJSON(`${BASE_URL}/api/db/listings`);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!data.success) throw new Error(data.error || "No success");
    if (!Array.isArray(data.listings)) throw new Error("listings no es un array");
    return `${data.listings.length} listings`;
  });

  // Test 3: Filtrar listings por precio
  await test("GET /api/db/listings?minPrice=300&maxPrice=500 - Filtrar por precio", async () => {
    const { status, data } = await fetchJSON(`${BASE_URL}/api/db/listings?minPrice=300&maxPrice=500`);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!data.success) throw new Error(data.error || "No success");
    // Verificar que todos los precios están en rango
    for (const listing of data.listings) {
      if (listing.price < 300 || listing.price > 500) {
        throw new Error(`Listing con precio fuera de rango: ${listing.price}`);
      }
    }
    return `${data.listings.length} listings en rango 300-500€`;
  });

  // Test 4: Ordenar listings
  await test("GET /api/db/listings?sortBy=price_asc - Ordenar por precio", async () => {
    const { status, data } = await fetchJSON(`${BASE_URL}/api/db/listings?sortBy=price_asc`);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!data.success) throw new Error(data.error || "No success");
    // Verificar orden ascendente
    for (let i = 1; i < data.listings.length; i++) {
      if (data.listings[i].price < data.listings[i - 1].price) {
        throw new Error("Orden incorrecto");
      }
    }
    return "Orden correcto";
  });

  // Test 5: Obtener listing específico
  await test("GET /api/db/listings - Obtener primer listing y verificar detalle", async () => {
    // Primero obtener la lista
    const { data: listData } = await fetchJSON(`${BASE_URL}/api/db/listings`);
    if (!listData.listings?.length) throw new Error("No hay listings");
    
    const firstId = listData.listings[0].id;
    
    // Obtener el detalle
    const { status, data } = await fetchJSON(`${BASE_URL}/api/db/listings/${firstId}`);
    if (status !== 200) throw new Error(`Status ${status}`);
    if (!data.success) throw new Error(data.error || "No success");
    if (!data.listing) throw new Error("No listing en respuesta");
    if (data.listing.id !== firstId) throw new Error("ID no coincide");
    
    return `Listing: ${data.listing.title}`;
  });

  // Test 6: API de productos (requiere auth - debe dar 401)
  await test("GET /api/db/products - Sin auth debe dar 401", async () => {
    const response = await fetch(`${BASE_URL}/api/db/products`);
    // Puede dar 401 o redirigir a login
    if (response.status === 401) {
      return "401 Unauthorized (correcto)";
    }
    // Si devuelve HTML es porque redirige a login
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("text/html")) {
      return "Redirige a login (correcto)";
    }
    throw new Error(`Status inesperado: ${response.status}`);
  });

  // Test 7: Verificar estructura de listing
  await test("Verificar estructura de listing con relaciones", async () => {
    const { data } = await fetchJSON(`${BASE_URL}/api/db/listings`);
    if (!data.listings?.length) throw new Error("No hay listings");
    
    const listing = data.listings[0];
    
    // Verificar campos requeridos
    const requiredFields = ["id", "title", "price", "status"];
    for (const field of requiredFields) {
      if (!(field in listing)) throw new Error(`Falta campo: ${field}`);
    }
    
    // Verificar relaciones
    if (!listing.product) throw new Error("Falta relación product");
    if (!listing.seller) throw new Error("Falta relación seller");
    
    return "Estructura correcta con relaciones";
  });

  // Test 8: Verificar estructura de categoría
  await test("Verificar estructura de categoría", async () => {
    const { data } = await fetchJSON(`${BASE_URL}/api/db/categories`);
    if (!data.categories?.length) throw new Error("No hay categorías");
    
    const category = data.categories[0];
    
    // Verificar campos requeridos
    const requiredFields = ["id", "name", "slug", "icon"];
    for (const field of requiredFields) {
      if (!(field in category)) throw new Error(`Falta campo: ${field}`);
    }
    
    // Verificar que ID empieza con cat-
    if (!category.id.startsWith("cat-")) {
      throw new Error(`ID inválido: ${category.id}`);
    }
    
    return "Estructura correcta";
  });

  // Resumen
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 RESUMEN DE TESTS API\n");
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`   ✅ Pasados: ${passed}`);
  console.log(`   ❌ Fallidos: ${failed}`);
  console.log(`   📝 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log("\n❌ Tests fallidos:");
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }

  console.log("\n" + "=".repeat(60) + "\n");
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
