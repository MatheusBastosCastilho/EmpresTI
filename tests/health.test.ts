// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { GET } from "@/app/health/route";
import { disconnectDatabase } from "@/src/server/db";
import { readServerEnv } from "@/src/server/env";

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl || process.env.DATABASE_URL !== testUrl) {
  throw new Error("Execute npm test: integração exige banco descartável criado pelo runner.");
}

afterAll(async () => { await disconnectDatabase(); });

describe("Andar zero com PostgreSQL real", () => {
  it("test_az_04_health_consulta_tabela_migrada_e_retorna_status_e_corpo", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ status: "ok", database: "connected" });
  });

  it("test_az_02_banco_indisponivel_retorna_503_sem_expor_conexao", async () => {
    await disconnectDatabase();
    process.env.DATABASE_URL = "postgresql://postgres:not-a-real-secret@127.0.0.1:1/invalid";
    try {
      const response = await GET();
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({
        status: "error", database: "unavailable", message: "Banco indisponível ou configuração inválida.",
      });
    } finally {
      await disconnectDatabase();
      process.env.DATABASE_URL = testUrl;
    }
  });

  it("test_az_07_configuracao_ausente_falha_com_mensagem_clara", () => {
    expect(() => readServerEnv({})).toThrow("Configuração inválida: DATABASE_URL");
    expect(() => readServerEnv({ DATABASE_URL: "https://example.com" })).toThrow("Configuração inválida");
  });
});
