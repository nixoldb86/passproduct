/**
 * Script de pruebas para verificar la conexión y operaciones con PostgreSQL
 * Ejecutar con: npx tsx scripts/test-db.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

async function runTests() {
  console.log("\n🧪 Iniciando tests de base de datos PostgreSQL...\n");
  console.log("=".repeat(60) + "\n");

  // Test 1: Conexión a la BD
  await test("Conexión a PostgreSQL", async () => {
    await prisma.$connect();
    return "Conectado";
  });

  // Test 2: Listar categorías
  await test("Listar categorías", async () => {
    const categories = await prisma.category.findMany();
    if (categories.length === 0) throw new Error("No hay categorías");
    return `${categories.length} categorías encontradas`;
  });

  // Test 3: Verificar IDs de categorías
  await test("Verificar IDs de categorías (cat-*)", async () => {
    const categories = await prisma.category.findMany();
    const invalidIds = categories.filter(c => !c.id.startsWith("cat-"));
    if (invalidIds.length > 0) {
      throw new Error(`IDs inválidos: ${invalidIds.map(c => c.id).join(", ")}`);
    }
    return `Todos los IDs son válidos (cat-*)`;
  });

  // Test 4: Listar usuarios
  await test("Listar usuarios", async () => {
    const users = await prisma.user.findMany();
    if (users.length === 0) throw new Error("No hay usuarios");
    return `${users.length} usuarios encontrados`;
  });

  // Test 5: Listar productos
  await test("Listar productos", async () => {
    const products = await prisma.product.findMany({
      include: { category: true, user: true }
    });
    if (products.length === 0) throw new Error("No hay productos");
    return `${products.length} productos encontrados`;
  });

  // Test 6: Listar listings publicados
  await test("Listar listings publicados", async () => {
    const listings = await prisma.listing.findMany({
      where: { status: "PUBLISHED" },
      include: { product: true, seller: true }
    });
    if (listings.length === 0) throw new Error("No hay listings publicados");
    return `${listings.length} listings publicados`;
  });

  // Test 7: Buscar categoría específica
  await test("Buscar categoría 'cat-smartphones'", async () => {
    const category = await prisma.category.findUnique({
      where: { id: "cat-smartphones" }
    });
    if (!category) throw new Error("Categoría no encontrada");
    return `Encontrada: ${category.name}`;
  });

  // Test 8: Verificar relaciones producto-categoría
  await test("Verificar relaciones producto-categoría", async () => {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    const withoutCategory = products.filter(p => !p.category);
    if (withoutCategory.length > 0) {
      throw new Error(`${withoutCategory.length} productos sin categoría`);
    }
    return "Todas las relaciones son válidas";
  });

  // Test 9: Verificar relaciones listing-seller
  await test("Verificar relaciones listing-seller", async () => {
    const listings = await prisma.listing.findMany({
      include: { seller: true }
    });
    const withoutSeller = listings.filter(l => !l.seller);
    if (withoutSeller.length > 0) {
      throw new Error(`${withoutSeller.length} listings sin vendedor`);
    }
    return "Todas las relaciones son válidas";
  });

  // Test 10: Crear y eliminar producto de prueba
  await test("CRUD: Crear producto de prueba", async () => {
    // Obtener un usuario y categoría existentes
    const user = await prisma.user.findFirst();
    const category = await prisma.category.findFirst();
    
    if (!user || !category) throw new Error("No hay usuario o categoría");

    const testProduct = await prisma.product.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        brand: "TEST",
        model: "Test Product",
        condition: "NEW",
        photos: [],
      }
    });

    // Verificar que se creó
    const found = await prisma.product.findUnique({
      where: { id: testProduct.id }
    });
    if (!found) throw new Error("Producto no encontrado después de crear");

    // Eliminar el producto de prueba
    await prisma.product.delete({
      where: { id: testProduct.id }
    });

    // Verificar que se eliminó
    const deleted = await prisma.product.findUnique({
      where: { id: testProduct.id }
    });
    if (deleted) throw new Error("Producto no se eliminó correctamente");

    return "Crear y eliminar funcionan correctamente";
  });

  // Resumen
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 RESUMEN DE TESTS\n");
  
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

  await prisma.$disconnect();
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
