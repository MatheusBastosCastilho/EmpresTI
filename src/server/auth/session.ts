import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { z } from "zod";

import { getDatabase } from "../db";
import type { MembershipRole } from "@/src/generated/prisma/client";

const sessionLifetime = 8 * 60 * 60;
const authEnvironment = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export function createAuthClient(cookies: CookieMethodsServer) {
  const environment = authEnvironment.safeParse(process.env);
  if (!environment.success) throw new Error("Supabase Auth não configurado.");
  return createServerClient(
    environment.data.NEXT_PUBLIC_SUPABASE_URL,
    environment.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { cookies, cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" } },
  );
}

export function hasActivePasswordSession(
  methods: (string | { method: string; timestamp: number })[] | undefined,
  now = Math.floor(Date.now() / 1000),
) {
  const passwordMethod = methods?.find((entry) => typeof entry !== "string" && entry.method === "password");
  const authenticatedAt = typeof passwordMethod === "object" ? passwordMethod.timestamp : undefined;
  return authenticatedAt !== undefined && authenticatedAt <= now && now - authenticatedAt < sessionLifetime;
}

export function findMembership(userId: string) {
  return getDatabase().membership.findFirst({
    where: { userId, tenant: { slug: "suporte_ti" } },
    select: { id: true, tenantId: true, role: true },
  });
}

export async function readMembership(auth: ReturnType<typeof createAuthClient>) {
  const { data, error } = await auth.auth.getClaims();
  if (error || !data || !hasActivePasswordSession(data.claims.amr)) return null;
  const session = z.uuid().safeParse(data.claims.session_id);
  if (!session.success) return null;
  const [membership] = await getDatabase().$queryRaw<{
    id: string;
    tenantId: string;
    role: MembershipRole;
  }[]>`
    SELECT membership.id, membership.tenant_id AS "tenantId", membership.role::text AS role
    FROM dev.memberships AS membership
    JOIN dev.tenants AS tenant ON tenant.id = membership.tenant_id
    JOIN auth.sessions AS session ON session.user_id = membership.user_id
    WHERE tenant.slug = 'suporte_ti' AND session.id = ${session.data}::uuid
      AND membership.user_id = ${data.claims.sub}::uuid
  `;
  return membership ?? null;
}
