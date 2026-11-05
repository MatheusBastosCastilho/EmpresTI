import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url().refine((value) => /^postgres(ql)?:/.test(value)),
});

export function readServerEnv(source: Record<string, string | undefined> = process.env) {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    throw new Error("Configuração inválida: DATABASE_URL deve conter uma conexão PostgreSQL válida.");
  }
  return parsed.data;
}
