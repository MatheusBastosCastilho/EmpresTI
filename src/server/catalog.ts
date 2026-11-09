import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@/src/generated/prisma/client";

type Membership = { id: string; tenantId: string };
const pageSize = 24;
const open = { returnedAt: null } as const;

export async function readCatalog(db: PrismaClient, tenantId: string, cursor?: string) {
  const rows = await db.equipment.findMany({
    where: { tenantId, ...(cursor ? { assetTag: { gt: cursor } } : {}) },
    orderBy: { assetTag: "asc" },
    take: pageSize + 1,
    select: {
      id: true, assetTag: true, name: true, status: true, pickupLocation: true,
      category: { select: { name: true } },
      loans: { where: open, select: { id: true }, take: 1 },
    },
  });
  const items = rows.slice(0, pageSize).map(({ loans, status, ...item }) => ({
    ...item,
    status: status === "AVAILABLE" && loans.length ? "BORROWED" as const : status,
  }));
  return { items, nextCursor: rows.length > pageSize ? items[pageSize - 1].assetTag : null };
}

export function readMyLoans(db: PrismaClient, member: Membership) {
  return db.loan.findMany({
    where: { ...open, tenantId: member.tenantId, borrowerMembershipId: member.id },
    orderBy: [{ dueAt: "asc" }, { id: "asc" }],
    select: { id: true, dueAt: true, equipment: { select: { assetTag: true, name: true } } },
  });
}

export async function requestLoan(db: PrismaClient, member: Membership, equipmentId: string) {
  return db.$transaction(async (tx) => {
    const [borrower] = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM dev.memberships WHERE tenant_id = ${member.tenantId}::uuid
      AND id = ${member.id}::uuid FOR UPDATE
    `;
    if (!borrower) throw new TRPCError({ code: "UNAUTHORIZED" });

    const [equipment] = await tx.$queryRaw<{ status: string }[]>`
      SELECT status::text AS status FROM dev.equipment
      WHERE tenant_id = ${member.tenantId}::uuid AND id = ${equipmentId}::uuid FOR UPDATE
    `;
    if (!equipment) throw new TRPCError({ code: "NOT_FOUND" });
    const existing = await tx.loan.findFirst({
      where: { ...open, tenantId: member.tenantId, equipmentId },
      select: { id: true },
    });
    if (equipment.status !== "AVAILABLE" || existing) throw new TRPCError({ code: "CONFLICT" });

    const [clock] = await tx.$queryRaw<{ time: Date }[]>`SELECT clock_timestamp() AS time`;
    const loans = await tx.loan.findMany({
      where: { ...open, tenantId: member.tenantId, borrowerMembershipId: member.id },
      select: { dueAt: true },
      take: 3,
    });
    if (loans.some(({ dueAt }) => dueAt < clock.time)) {
      throw new TRPCError({ code: "PRECONDITION_FAILED" });
    }
    if (loans.length >= 3) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

    const loan = await tx.loan.create({
      data: {
        tenantId: member.tenantId, borrowerMembershipId: member.id, equipmentId,
        borrowedAt: clock.time, dueAt: new Date(clock.time.getTime() + 14 * 86_400_000),
      },
      select: { id: true, dueAt: true },
    });
    await tx.auditLog.create({
      data: {
        tenantId: member.tenantId, actorMembershipId: member.id,
        action: "loan.requested", resourceType: "loan", resourceId: loan.id,
      },
    });
    return loan;
  }, { isolationLevel: "ReadCommitted" });
}
