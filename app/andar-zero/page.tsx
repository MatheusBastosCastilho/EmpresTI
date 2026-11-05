"use client";

import { useEffect, useState } from "react";

type Health = { status: string; database: string; message?: string };

export default function AndarZeroPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  async function verify() {
    setLoading(true);
    try {
      const response = await fetch("/health", { cache: "no-store" });
      const result: Health = await response.json();
      setHealth(result);
    } catch {
      setHealth({ status: "error", database: "unavailable", message: "Não foi possível consultar o servidor." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void verify(); }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 p-8">
      <p className="text-sm uppercase tracking-widest text-muted-foreground">EmpresTI · infraestrutura</p>
      <h1 className="text-3xl font-semibold">Andar zero</h1>
      <p>Prova da comunicação entre esta página, o endpoint /health e uma tabela criada por migration no PostgreSQL.</p>
      <section aria-live="polite" aria-busy={loading} className="rounded-xl border p-6">
        {loading ? <p>Verificando conexão…</p> : health?.status === "ok" ? (
          <><h2 className="text-xl font-medium">Banco conectado</h2><p>Servidor e PostgreSQL responderam corretamente.</p></>
        ) : (
          <><h2 className="text-xl font-medium">Banco indisponível</h2><p>{health?.message}</p></>
        )}
        {!loading && <pre className="mt-4 overflow-auto text-sm">{JSON.stringify(health, null, 2)}</pre>}
      </section>
      <button className="w-fit rounded-md border px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-4" onClick={() => void verify()} disabled={loading}>
        Verificar novamente
      </button>
      <a className="underline" href="/login">Abrir login demonstrativo</a>
    </main>
  );
}
