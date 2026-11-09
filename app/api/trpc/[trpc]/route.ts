import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";

import { appRouter, createContext } from "@/src/server/api/routers/auth";

function handler(request: NextRequest) {
  if (request.method === "POST") {
    const host = request.headers.get("host");
    const protocol = process.env.VERCEL === "1" ? "https:" : request.nextUrl.protocol;
    if (!host || request.headers.get("origin") !== `${protocol}//${host}`) {
      return new Response(null, { status: 403 });
    }
  }
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createContext(request),
    responseMeta: () => ({ headers: { "Cache-Control": "private, no-store" } }),
  });
}

export { handler as GET, handler as POST };
