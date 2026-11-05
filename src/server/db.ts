import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/src/generated/prisma/client";
import { readServerEnv } from "./env";

const globalDatabase = globalThis as unknown as { empresTiPrisma?: PrismaClient };

export function getDatabase() {
  const { DATABASE_URL } = readServerEnv();
  if (!globalDatabase.empresTiPrisma) {
    const adapter = new PrismaPg({
      connectionString: DATABASE_URL,
      connectionTimeoutMillis: 3000,
      query_timeout: 3000,
      max: 2,
    });
    globalDatabase.empresTiPrisma = new PrismaClient({ adapter });
  }
  return globalDatabase.empresTiPrisma;
}

export async function checkDatabase() {
  // Touch a migration-owned table, without returning business records.
  await getDatabase().$queryRaw`SELECT id FROM dev.tenants LIMIT 1`;
}

export async function disconnectDatabase() {
  await globalDatabase.empresTiPrisma?.$disconnect();
  globalDatabase.empresTiPrisma = undefined;
}
