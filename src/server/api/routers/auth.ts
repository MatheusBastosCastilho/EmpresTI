import { initTRPC, TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import type { SetAllCookies } from "@supabase/ssr";
import superjson from "superjson";
import { z } from "zod";

import { createAuthClient, findMembership, readMembership } from "@/src/server/auth/session";
import { finishLoginAttempt, readClientIp, reserveLoginAttempt } from "@/src/server/auth/login-attempts";
import { getDatabase } from "@/src/server/db";
import { readCatalog, readMyLoans, requestLoan } from "@/src/server/catalog";

export function createContext(request: Request) {
  return {
    request,
    async readSession() {
      const store = await cookies();
      const auth = createAuthClient({
        getAll: () => store.getAll(),
        setAll: (changes) => changes.forEach(({ name, value, options }) => store.set(name, value, options)),
      });
      return readMembership(auth);
    },
  };
}

const t = initTRPC.context<ReturnType<typeof createContext>>().create({
  transformer: superjson,
  isDev: false,
  errorFormatter({ shape }) {
    return { ...shape, message: "Não foi possível concluir a operação." };
  },
});
const noInput = z.undefined();
const tenantProcedure = t.procedure.use(async ({ ctx, next }) => {
  const membership = await ctx.readSession();
  if (!membership) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { membership, db: getDatabase() } });
});

export const appRouter = t.router({
  login: t.procedure
    .input(z.object({
      email: z.string().trim().toLowerCase().max(254).email(),
      password: z.string().min(1).max(1024),
    }))
    .mutation(async ({ ctx, input }) => {
      const store = await cookies();
      const pending: Parameters<SetAllCookies>[0] = [];
      const auth = createAuthClient({
        getAll: () => store.getAll(),
        setAll: (changes) => { pending.push(...changes); },
      });
      const attempt = await reserveLoginAttempt(input.email, readClientIp(ctx.request));
      if (!attempt) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const { data, error } = await auth.auth.signInWithPassword(input);
      const membership = !error && data.user ? await findMembership(data.user.id) : null;
      await finishLoginAttempt(attempt, Boolean(membership));
      if (!membership) throw new TRPCError({ code: "UNAUTHORIZED" });

      for (const { name, value, options } of pending) store.set(name, value, options);
      return { success: true };
    }),
  logout: t.procedure.input(noInput).mutation(async () => {
    const store = await cookies();
    const auth = createAuthClient({
      getAll: () => store.getAll(),
      setAll: (changes) => changes.forEach(({ name, value, options }) => store.set(name, value, options)),
    });
    const { error } = await auth.auth.signOut({ scope: "local" });
    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return { success: true };
  }),
  session: tenantProcedure.input(noInput).query(({ ctx }) => ({ role: ctx.membership.role })),
  catalog: tenantProcedure.input(z.object({ cursor: z.string().max(100).optional() }).strict())
    .query(({ ctx, input }) => readCatalog(ctx.db, ctx.membership.tenantId, input.cursor)),
  myLoans: tenantProcedure.input(noInput).query(({ ctx }) => readMyLoans(ctx.db, ctx.membership)),
  requestLoan: tenantProcedure.input(z.object({ equipmentId: z.uuid() }).strict())
    .mutation(({ ctx, input }) => requestLoan(ctx.db, ctx.membership, input.equipmentId)),
});
