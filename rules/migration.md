---
description: Procedimento para qualquer mudança de schema
globs: ["prisma/migrations/**", "prisma/schema.prisma", "<CAMINHO-DO-ACESSO-A-DADOS>"]
alwaysApply: false
---

# Mudança de schema
> leitor: agente

## Quando
Qualquer tarefa que precise criar, alterar ou remover tabela, coluna,
índice, constraint ou política de acesso — inclusive quando a mudança
parecer trivial.

## Procedimento
1. Antes de gerar qualquer coisa: escreva o DDL pretendido na resposta
   e PARE. Eu aprovo ou corrijo.
2. Gere a migration com Prisma Migrate contra o Supabase local:
   `npx prisma migrate dev --name <nome>`. Uma migration por tarefa.
3. Prisma Migrate é o único dono do schema. SQL que o Prisma não modela,
   incluindo RLS, policies e triggers, deve ser escrito no
   `migration.sql` da mesma migration Prisma antes de ela ser considerada
   concluída.
4. Toda tabela nova nasce com Row Level Security habilitada e pelo menos
   uma policy explícita na mesma migration. Tabela sem policy não entra no
   repositório.
5. Se a tabela já tem dado, diga o que acontece com as linhas
   existentes. Coluna obrigatória nova precisa de default ou de um
   passo de preenchimento.
6. Valide do zero com `npx prisma migrate reset --force`, usando somente
   a conexão direta do Supabase local, e rode `<COMANDO-TESTES>`.

## Verificação
`npx prisma migrate reset --force` contra o Supabase local aplica todas as
migrations Prisma do zero, incluindo RLS, policies e triggers, sem erro e
sem nenhum passo manual.

## Não faça
- Não use `supabase migration new`, `supabase db push` ou a pasta
  `supabase/migrations/` para alterar o schema.
- Não altere schema pelo Studio nem por SQL avulso. O que não está numa
  migration Prisma não existe.
- Não edite migration que já foi para o repositório remoto. Escreva
  a próxima.
- Não toque no projeto Supabase remoto. Tudo acontece no local.
