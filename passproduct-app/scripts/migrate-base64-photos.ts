/**
 * Migra las imágenes guardadas en base64 dentro de la base de datos
 * (Product.photos, Product.proofOfPurchaseUrl, Listing.photos) al almacén
 * de ficheros definido en src/lib/storage.ts y deja solo la URL en la BD.
 *
 * Uso (carga las variables de .env.local):
 *   set -a; source .env.local; set +a; npx tsx scripts/migrate-base64-photos.ts [--dry-run]
 */
import { PrismaClient } from "@prisma/client";
import { isDataUrl, storeDataUrl, storageDriver } from "../src/lib/storage";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

let converted = 0;
let bytesFreed = 0;
let failed = 0;

async function convert(value: string, ownerId: string, kind: "product" | "proof"): Promise<string> {
  if (!isDataUrl(value)) return value;
  bytesFreed += value.length;
  if (dryRun) {
    converted++;
    return "<dry-run>";
  }
  try {
    const url = await storeDataUrl(value, { kind, ownerId });
    converted++;
    return url;
  } catch (error) {
    failed++;
    console.error("  Error convirtiendo imagen:", (error as Error).message);
    return value; // se deja como estaba
  }
}

async function migrateProducts() {
  const products = await prisma.product.findMany({
    select: { id: true, userId: true, photos: true, proofOfPurchaseUrl: true },
  });
  for (const p of products) {
    const needs = p.photos.some(isDataUrl) || isDataUrl(p.proofOfPurchaseUrl);
    if (!needs) continue;
    console.log(`Product ${p.id}`);
    const photos: string[] = [];
    for (const photo of p.photos) photos.push(await convert(photo, p.userId, "product"));
    const proof = p.proofOfPurchaseUrl
      ? await convert(p.proofOfPurchaseUrl, p.userId, "proof")
      : p.proofOfPurchaseUrl;
    if (!dryRun) {
      await prisma.product.update({
        where: { id: p.id },
        data: { photos, proofOfPurchaseUrl: proof },
      });
    }
  }
}

async function migrateListings() {
  const listings = await prisma.listing.findMany({
    select: { id: true, sellerId: true, photos: true },
  });
  for (const l of listings) {
    if (!l.photos.some(isDataUrl)) continue;
    console.log(`Listing ${l.id}`);
    const photos: string[] = [];
    for (const photo of l.photos) photos.push(await convert(photo, l.sellerId, "product"));
    if (!dryRun) {
      await prisma.listing.update({ where: { id: l.id }, data: { photos } });
    }
  }
}

async function main() {
  console.log(`Driver de almacenamiento: ${storageDriver()}${dryRun ? " (dry-run)" : ""}`);
  await migrateProducts();
  await migrateListings();
  console.log(
    `\nImágenes convertidas: ${converted}, fallidas: ${failed}, ` +
      `texto base64 retirado de la BD: ${(bytesFreed / 1024 / 1024).toFixed(1)} MB`
  );
  if (!dryRun && converted > 0) {
    console.log("Sugerencia: ejecuta VACUUM FULL sobre Product y Listing para recuperar el espacio en disco.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
