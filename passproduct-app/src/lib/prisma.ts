import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Crear cliente base con logging de queries lentas
const createPrismaClient = () => {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "error" },
            { emit: "stdout", level: "warn" },
          ]
        : [{ emit: "stdout", level: "error" }],
  });

  // En desarrollo, loguear queries lentas (>100ms)
  if (process.env.NODE_ENV === "development") {
    client.$on("query" as never, (e: { duration: number; query: string }) => {
      if (e.duration > 100) {
        console.warn(`⚠️ Slow query (${e.duration}ms):`, e.query.substring(0, 200));
      }
    });
  }

  return client;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
