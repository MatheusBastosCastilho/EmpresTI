import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";

import { PrismaClient } from "../src/generated/prisma/client.ts";

const inventory = [
  ["TI-0001", "Notebook 14 polegadas", "Notebook"],
  ["TI-0002", "Notebook 15 polegadas", "Notebook"],
  ["TI-0003", "Notebook 13 polegadas", "Notebook"],
  ["TI-0004", "Notebook 15 polegadas", "Notebook"],
  ["TI-0005", "Monitor 24 polegadas", "Monitor"],
  ["TI-0006", "Monitor 27 polegadas", "Monitor"],
  ["TI-0007", "Monitor 22 polegadas", "Monitor"],
  ["TI-0008", "Cabo HDMI 2 m", "Cabo"],
  ["TI-0009", "Cabo USB-C 1 m", "Cabo"],
  ["TI-0010", "Cabo de rede 3 m", "Cabo"],
  ["TI-0011", "Webcam Full HD", "Câmera"],
  ["TI-0012", "Câmera compacta", "Câmera"],
] as const;

const maintenance = new Set(["TI-0004", "TI-0007", "TI-0010"]);
const pickupLocation = "Balcão de Suporte TI";

export async function seedDatabase(db: PrismaClient, teacherId: string) {
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended('empres-ti:seed:suporte_ti', 0))`;
    const teacher = await tx.authUser.findUnique({ where: { id: teacherId } });
    if (!teacher) throw new Error("Provisione a conta docente no Supabase Auth antes do seed.");

    const tenant = await tx.tenant.upsert({
      where: { slug: "suporte_ti" },
      create: { slug: "suporte_ti", name: "Suporte TI" },
      update: {},
    });
    const membership = await tx.membership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: teacher.id } },
      create: { tenantId: tenant.id, userId: teacher.id, displayName: "Professor", role: "COLLABORATOR" },
      update: {},
    });
    if (membership.role !== "COLLABORATOR") throw new Error("O vínculo docente existente precisa ser revisado pelo operador.");

    const existingCategories = await tx.equipmentCategory.findMany({ where: { tenantId: tenant.id } });
    const categories = new Map(existingCategories.map(({ name, id }) => [name.trim().toLowerCase(), id]));
    const divergences: string[] = [];
    for (const [assetTag, name, category] of inventory) {
      const key = category.toLowerCase();
      let categoryId = categories.get(key);
      if (!categoryId) {
        const created = await tx.equipmentCategory.create({ data: { tenantId: tenant.id, name: category } });
        categoryId = created.id;
        categories.set(key, categoryId);
      }
      const equipment = await tx.equipment.upsert({
        where: { tenantId_assetTag: { tenantId: tenant.id, assetTag } },
        create: {
          tenantId: tenant.id,
          assetTag,
          name,
          categoryId,
          pickupLocation,
          status: maintenance.has(assetTag) ? "MAINTENANCE" : "AVAILABLE",
        },
        update: {},
      });
      if (equipment.name !== name || equipment.categoryId !== categoryId || equipment.pickupLocation !== pickupLocation) {
        divergences.push(assetTag);
      }
    }

    const teacherLoans = await tx.loan.count({ where: { tenantId: tenant.id, borrowerMembershipId: membership.id } });
    return { equipment: inventory.length, teacherLoans, divergences };
  }, { isolationLevel: "ReadCommitted", timeout: 15_000 });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { config } = await import("dotenv");
  config({ quiet: true });
  const teacher = z.uuid().safeParse(process.argv[2]);
  const remote = process.argv[3] === "--operator-remote";
  try {
    if (!teacher.success) throw new Error("Informe o UUID da conta docente.");
    const target = new URL(process.env.DIRECT_URL ?? "invalid:");
    const local = ["127.0.0.1", "localhost", "[::1]"].includes(target.hostname);
    if (!["postgres:", "postgresql:"].includes(target.protocol) || target.searchParams.get("schema") !== "dev" ||
        (local ? remote || target.port !== "54322" : !remote || target.searchParams.get("sslmode") !== "require")) {
      throw new Error("Destino inválido. Use o Supabase local ou, como operador, conexão direta TLS no schema dev.");
    }

    const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: target.href }) });
    try {
      const result = await seedDatabase(db, teacher.data);
      console.log(JSON.stringify(result));
      if (result.teacherLoans || result.divergences.length) process.exitCode = 1;
    } finally {
      await db.$disconnect();
    }
  } catch {
    console.error("Seed interrompido. Confira o UUID docente, seu vínculo e a conexão do schema dev.");
    process.exitCode = 1;
  }
}
