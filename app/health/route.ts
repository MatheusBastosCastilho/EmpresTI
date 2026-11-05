import { checkDatabase } from "@/src/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await checkDatabase();
    return Response.json(
      { status: "ok", database: "connected" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "error", database: "unavailable", message: "Banco indisponível ou configuração inválida." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
