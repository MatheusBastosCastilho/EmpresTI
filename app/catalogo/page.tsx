import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createAuthClient, readMembership } from "@/src/server/auth/session";
import { LogoutButton } from "./logout-button";

export default async function CatalogPage() {
  const store = await cookies();
  const auth = createAuthClient({ getAll: () => store.getAll(), setAll: () => {} });
  if (!(await readMembership(auth))) redirect("/login");

  return (
    <main className="mx-auto flex w-full max-w-5xl items-start justify-between gap-4 p-8">
      <h1 className="text-2xl font-semibold">Catálogo</h1>
      <LogoutButton />
    </main>
  );
}
