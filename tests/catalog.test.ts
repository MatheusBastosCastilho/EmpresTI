// @vitest-environment node
import { randomUUID } from "node:crypto";
import { afterAll, expect, it } from "vitest";
import { readCatalog, readMyLoans, requestLoan } from "@/src/server/catalog";
import { disconnectDatabase, getDatabase } from "@/src/server/db";

if (!process.env.TEST_DATABASE_URL || process.env.DATABASE_URL !== process.env.TEST_DATABASE_URL) {
  throw new Error("Execute npm test: integração exige banco descartável criado pelo runner.");
}

afterAll(disconnectDatabase);

async function fixture() {
  const db = getDatabase();
  const tenant = await db.tenant.create({ data: { slug: `test-${randomUUID()}`, name: "Tenant de teste" } });
  const category = await db.equipmentCategory.create({ data: { tenantId: tenant.id, name: "Monitor" } });
  const makeMember = async () => {
    const user = await db.authUser.create({ data: { id: randomUUID() } });
    return db.membership.create({ data: { tenantId: tenant.id, userId: user.id, displayName: "Teste" } });
  };
  const makeItem = (assetTag: string, status: "AVAILABLE" | "MAINTENANCE" | "RETIRED" = "AVAILABLE") =>
    db.equipment.create({ data: {
      tenantId: tenant.id, categoryId: category.id, name: assetTag, assetTag, status, pickupLocation: "Balcão",
    } });
  return { db, tenant, makeMember, makeItem };
}

it("CA-01 a CA-03 e CA-06 filtram tenant e vínculo e registram empréstimo com auditoria", async () => {
  const a = await fixture();
  const b = await fixture();
  const member = await a.makeMember();
  const other = await a.makeMember();
  const item = await a.makeItem("TI-1");
  const maintenance = await a.makeItem("TI-2", "MAINTENANCE");
  const retired = await a.makeItem("TI-3", "RETIRED");
  const foreign = await b.makeItem("TI-9");
  const created = await requestLoan(a.db, member, item.id);

  const loan = await a.db.loan.findUniqueOrThrow({ where: { id: created.id } });
  expect(loan.dueAt.getTime() - loan.borrowedAt.getTime()).toBe(14 * 86_400_000);
  expect(await a.db.auditLog.findFirst({ where: { resourceId: loan.id } }))
    .toMatchObject({ actorMembershipId: member.id, action: "loan.requested", tenantId: a.tenant.id });
  expect((await readCatalog(a.db, a.tenant.id)).items.map(({ assetTag, status }) => [assetTag, status]))
    .toEqual([["TI-1", "BORROWED"], ["TI-2", "MAINTENANCE"], ["TI-3", "RETIRED"]]);
  expect(await readMyLoans(a.db, member)).toMatchObject([{ id: loan.id, dueAt: loan.dueAt }]);
  expect(await readMyLoans(a.db, other)).toEqual([]);
  for (const blocked of [item, maintenance, retired]) {
    await expect(requestLoan(a.db, other, blocked.id)).rejects.toMatchObject({ code: "CONFLICT" });
  }
  await expect(requestLoan(a.db, other, foreign.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
});

it("CA-04 e CA-05 bloqueiam as duas corridas e o empréstimo vencido", async () => {
  const { db, tenant, makeMember, makeItem } = await fixture();
  const member = await makeMember();
  const other = await makeMember();
  const same = await makeItem("TI-1");
  const collision = await Promise.allSettled([requestLoan(db, member, same.id), requestLoan(db, other, same.id)]);
  expect(collision.map(({ status }) => status).sort()).toEqual(["fulfilled", "rejected"]);
  expect(await db.loan.count({ where: { equipmentId: same.id, returnedAt: null } })).toBe(1);

  const limited = await makeMember();
  const equipment = await Promise.all([2, 3, 4, 5, 6].map((i) => makeItem(`TI-${i}`)));
  await requestLoan(db, limited, equipment[0].id);
  await requestLoan(db, limited, equipment[1].id);
  const cap = await Promise.allSettled(equipment.slice(2, 4).map(({ id }) => requestLoan(db, limited, id)));
  expect(cap.map(({ status }) => status).sort()).toEqual(["fulfilled", "rejected"]);
  expect(await db.loan.count({ where: { tenantId: tenant.id, borrowerMembershipId: limited.id, returnedAt: null } })).toBe(3);
  await expect(requestLoan(db, limited, equipment[4].id)).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });

  const overdue = await makeMember();
  const old = await makeItem("TI-7");
  await db.loan.create({ data: {
    tenantId: tenant.id, equipmentId: old.id, borrowerMembershipId: overdue.id,
    borrowedAt: new Date(Date.now() - 15 * 86_400_000), dueAt: new Date(Date.now() - 86_400_000),
  } });
  await expect(requestLoan(db, overdue, equipment[4].id)).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
});
