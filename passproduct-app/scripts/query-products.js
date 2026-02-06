const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { id: { in: ['cml9it3q40001se5bqidkzp90', 'cml9irob000022hdv5o9v2tik'] } },
    select: { id: true, brand: true, model: true, variant: true, categoryId: true }
  });
  console.log(JSON.stringify(products, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
