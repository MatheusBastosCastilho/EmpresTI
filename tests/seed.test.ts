// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, expect, it } from "vitest";

import { seedDatabase } from "@/prisma/seed";
import { disconnectDatabase, getDatabase } from "@/src/server/db";

if (!process.env.TEST_DATABASE_URL || process.env.DATABASE_URL !== process.env.TEST_DATABASE_URL) {
  throw new Error("Execute npm test: integração exige banco descartável criado pelo runner.");
}

afterAll(disconnectDatabase);

it("CA-01 a CA-04 cria os dados iniciais uma vez e preserva estados e empréstimos", async () => {
  const db = getDatabase();
  const teacher = await db.authUser.create({ data: { id: randomUUID() } });
  expect(await seedDatabase(db, teacher.id)).toEqual({ equipment: 12, teacherLoans: 0, divergences: [] });
  const tenant = await db.tenant.findUniqueOrThrow({ where: { slug: "suporte_ti" } });
  const items = await db.equipment.findMany({
    where: { tenantId: tenant.id },
    orderBy: { assetTag: "asc" },
    include: { category: true },
  });
  expect(items.map(({ assetTag }) => assetTag)).toEqual(
    Array.from({ length: 12 }, (_, index) => `TI-${String(index + 1).padStart(4, "0")}`),
  );
  expect(items.filter(({ status }) => status === "MAINTENANCE").map(({ assetTag }) => assetTag))
    .toEqual(["TI-0004", "TI-0007", "TI-0010"]);
  expect(items.every(({ pickupLocation }) => pickupLocation === "Balcão de Suporte TI")).toBe(true);
  expect([...new Set(items.map(({ category }) => category.name))]).toEqual(["Notebook", "Monitor", "Cabo", "Câmera"]);
  const membership = await db.membership.findUniqueOrThrow({ where: { tenantId_userId: { tenantId: tenant.id, userId: teacher.id } } });
  expect(membership.role).toBe("COLLABORATOR");
  expect(await db.loan.count({ where: { tenantId: tenant.id } })).toBe(0);

  await db.equipment.update({ where: { id: items[0].id }, data: { status: "RETIRED" } });
  const student = await db.authUser.create({ data: { id: randomUUID() } });
  const borrower = await db.membership.create({ data: { tenantId: tenant.id, userId: student.id, displayName: "Teste" } });
  const loan = await db.loan.create({
    data: {
      tenantId: tenant.id, equipmentId: items[1].id, borrowerMembershipId: borrower.id,
      dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  expect(await seedDatabase(db, teacher.id)).toEqual({ equipment: 12, teacherLoans: 0, divergences: [] });
  expect(await db.equipment.count({ where: { tenantId: tenant.id } })).toBe(12);
  expect(await db.equipmentCategory.count({ where: { tenantId: tenant.id } })).toBe(4);
  expect(await db.membership.count({ where: { tenantId: tenant.id } })).toBe(2);
  expect(await db.equipment.findUnique({ where: { id: items[0].id } })).toMatchObject({ status: "RETIRED" });
  expect(await db.loan.findUnique({ where: { id: loan.id } })).toMatchObject({ returnedAt: null });
});
