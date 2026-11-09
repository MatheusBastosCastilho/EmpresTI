import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { createAuthClient, readMembership } from "@/src/server/auth/session";
import { appRouter } from "@/src/server/api/routers/auth";
import photos from "@/data/equipment-photos.json";
import { LoanButton } from "./loan-button";
import { LogoutButton } from "./logout-button";

const statusLabels = {
  AVAILABLE: "Disponível",
  BORROWED: "Emprestado",
  MAINTENANCE: "Em manutenção",
  RETIRED: "Fora de circulação",
};
const photoByTag = new Map(photos.map((photo) => [photo.patrimonio, photo]));
const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" });

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ cursor?: string | string[] }> }) {
  const store = await cookies();
  const auth = createAuthClient({ getAll: () => store.getAll(), setAll: () => {} });
  const membership = await readMembership(auth);
  if (!membership) redirect("/login");
  const caller = appRouter.createCaller({
    request: new Request("http://localhost/catalogo"),
    readSession: async () => membership,
  });
  const { cursor } = await searchParams;
  const [catalog, loans] = await Promise.all([
    caller.catalog({ cursor: typeof cursor === "string" && cursor.length <= 100 ? cursor : undefined }),
    caller.myLoans(),
  ]);
  const storage = new URL("/storage/v1/object/public/empres-ti-equipamentos/", process.env.NEXT_PUBLIC_SUPABASE_URL);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Catálogo</h1>
        <LogoutButton />
      </header>
      <section aria-labelledby="loans-title" className="rounded-lg border border-border p-4">
        <h2 id="loans-title" className="font-semibold">Meus empréstimos em aberto</h2>
        {loans.length ? (
          <ul className="mt-2 space-y-2 text-sm">
            {loans.map((loan) => (
              <li key={loan.id}>{loan.equipment.name} · {loan.equipment.assetTag} · Devolução em {date.format(loan.dueAt)}</li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-muted-foreground">Você não tem empréstimos em aberto.</p>}
      </section>
      <section aria-labelledby="equipment-title">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="equipment-title" className="font-semibold">Equipamentos</h2>
          <a className="text-sm underline" href="https://pixabay.com/">Fotos: Pixabay</a>
        </div>
        {catalog.items.length === 0 && <p className="text-muted-foreground">Nenhum equipamento nesta página.</p>}
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.items.map((item) => {
            const photo = photoByTag.get(item.assetTag);
            return (
              <li key={item.id} className="overflow-hidden rounded-lg border border-border">
                {photo ? (
                  // The fixed public Storage endpoint already serves a validated 800 × 600 JPEG.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={new URL(photo.objeto, storage).href} alt={`Foto ilustrativa de ${item.name}`} width={800} height={600} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="grid aspect-[4/3] place-items-center bg-sunken text-sm text-muted-foreground">Foto indisponível</div>
                )}
                <div className="flex flex-col gap-2 p-4">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.assetTag} · {item.category.name}</p>
                  <p className="text-sm">{item.pickupLocation} · {statusLabels[item.status]}</p>
                  {item.status === "AVAILABLE" && <LoanButton equipmentId={item.id} />}
                </div>
              </li>
            );
          })}
        </ul>
        <nav aria-label="Páginas do catálogo" className="mt-4 flex gap-4">
          {cursor && <Link className="underline" href="/catalogo">Voltar ao início</Link>}
          {catalog.nextCursor && <Link className="underline" href={`/catalogo?cursor=${encodeURIComponent(catalog.nextCursor)}`}>Próxima página</Link>}
        </nav>
      </section>
    </main>
  );
}
