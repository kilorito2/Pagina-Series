import { PrismaClient } from "@prisma/client";

/**
 * Cliente único de Prisma. En desarrollo, Next.js recarga módulos con
 * cada cambio (HMR), así que guardamos la instancia en `globalThis`
 * para no abrir una conexión nueva a la base de datos en cada recarga.
 */
const globalParaPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalParaPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = prisma;
}
