# Revisão da estrutura do repositório

Data: 05/11/2026. Raiz local: `EmpresTI`. Origem Git: repositório próprio
`MatheusBastosCastilho/EmpresTI`. O projeto foi aberto no VS Code nesta sessão.

## Organização e responsabilidade

| Caminho | Responsabilidade |
| --- | --- |
| `app/` | Rotas, layouts e handlers do Next App Router |
| `components/login/` | Formulário demonstrativo e testes |
| `components/ui/` | Primitivas de interface |
| `lib/` | Utilitários compartilhados que podem ser usados no cliente |
| `src/server/` | Configuração e acesso ao banco, exclusivos do servidor |
| `src/generated/prisma/` | Cliente gerado, não versionado |
| `prisma/schema.prisma` | Modelo Prisma do domínio dev e referência externa ao Auth |
| `prisma/migrations-dev/` | Único histórico ativo de migrations |
| `prisma/migrations/` | Histórico importado preservado; não reaplicar no remoto |
| `prisma/tests/` | Smoke SQL do domínio para execução somente local |
| `scripts/` | Automação local e aplicação controlada de migrations dev |
| `tests/` | Integração em PostgreSQL descartável e testes do endpoint |
| `supabase/` | Configuração dos serviços locais; não é dono das migrations |
| `docs/adr/` | Decisões técnicas e suas razões |
| `docs/specs/` | Comportamento de produto, planos e tarefas |
| `docs/referencias/` | Material externo sem autoridade sobre decisões locais |
| `rules/` | Procedimentos e limites de atuação |
| `.github/workflows/` | Automação do repositório |

## Ajustes e cuidados

- `docs/layout.md` é a referência visual oficial apontada pelo AGENTS. O arquivo
  `layout.md` da raiz é legado; não foi removido nem tratado como nova autoridade.
- A numeração de specs existente não será reescrita. O rascunho da primeira
  funcionalidade real (login) recebe a próxima numeração livre, com justificativa.
- `docs/stack_H.md` é rascunho histórico, não base de decisões.
- A pasta `prisma/migrations` antiga não compete com a ativa: o caminho ativo está
  definido explicitamente em `prisma.config.ts`.
- Os arquivos `.env` reais, `.next`, `node_modules`, cliente gerado e `.vercel`
  devem continuar fora do Git e do ZIP de entrega.
- Não mover pastas, renomear documentos aceitos ou apagar material antigo apenas
  por estética. Novas regras de negócio seguirão Router tRPC → Service → Prisma.

## Situação histórica

O histórico importado já tinha scaffold, login demonstrativo e modelo de dados.
Não é possível afirmar retroativamente que a ordem didática foi seguida. O
fechamento atual acrescenta as provas ausentes com commits rastreáveis, sem
reescrever a história nem apresentar código de referência como autoria própria.
