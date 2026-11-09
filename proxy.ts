import { NextResponse, type NextRequest } from "next/server";

import { createAuthClient, hasActivePasswordSession } from "@/src/server/auth/session";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const auth = createAuthClient({
    getAll: () => request.cookies.getAll(),
    setAll: (changes) => {
      for (const { name, value } of changes) request.cookies.set(name, value);
      for (const { name, value, options } of changes) response.cookies.set(name, value, options);
    },
  });
  const { data, error } = await auth.auth.getClaims();
  if (error || !data || !hasActivePasswordSession(data.claims.amr)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Pass refreshed cookies to the protected route as well as to the browser.
  const updated = NextResponse.next({ request });
  for (const cookie of response.cookies.getAll()) updated.cookies.set(cookie);
  updated.headers.set("Cache-Control", "private, no-store");
  return updated;
}

export const config = { matcher: ["/catalogo/:path*"] };
