# Plano — Modelo de dados inicial

**Status:** aguardando aprovação  
**Spec:** `docs/specs/002-modelo-dados/spec.md`

## Restrições

- Seguir `docs/prd.md` e `docs/adr/001-stack.md`.
- Usar PostgreSQL local do Supabase.
- Usar Prisma Migrate como único dono do schema.
- Manter SQL de RLS, policies, funções e triggers na migration Prisma.
- Não tocar no Supabase remoto, Vercel ou variáveis existentes.
- Não instalar dependências sem autorização específica.
- Executar uma tarefa por vez e uma migration por tarefa.

## Estratégia

### 1. Preparar Prisma e ambiente local

- Adicionar Prisma e o cliente Prisma nas versões compatíveis com a aplicação.
- Criar configuração Prisma e schema inicial em modo strict.
- Declarar `DATABASE_URL` para runtime e `DIRECT_URL` para migrations sem expor
  valores.
- Criar `.env.example` apenas depois de alinhar as três localizações exigidas em
  `rules/secrets.md`.
- Confirmar que o Supabase local está disponível antes de qualquer migration.

### 2. Criar a migration inicial

- Modelar enums e tabelas no Prisma.
- Gerar uma única migration inicial com Prisma Migrate.
- Inspecionar o SQL gerado antes de aplicá-lo.
- Completar a mesma migration com constraints, índices parciais, funções,
  triggers, RLS e policies que o Prisma não representa.
- Não editar a migration depois que ela for compartilhada no repositório
  remoto.

### 3. Criar seed idempotente

- Criar o tenant `suporte_ti` por slug.
- Criar categorias iniciais de notebook, monitor, cabo, câmera e projetor.
- Permitir executar o seed repetidamente sem duplicar registros.
- Não criar usuário real nem credencial no seed.

### 4. Testar o schema

- Usar PostgreSQL real em ambiente isolado.
- Provar unicidade de patrimônio por tenant.
- Provar bloqueio de dois empréstimos abertos para o mesmo equipamento.
- Provar consistência da devolução e imutabilidade do empréstimo.
- Provar isolamento entre tenants e restrições de RLS.
- Provar que audit logs não podem ser atualizados ou removidos.

### 5. Validar do zero

- Executar `npx prisma migrate reset --force` somente no banco local.
- Rodar seed, testes, lint e build.
- Conferir que nenhum segredo foi incluído no diff.
- Conferir `git status --short` antes do handoff.

## Ordem de entrega

1. Aprovação do DDL apresentado junto deste plano.
2. Autorização para instalar as dependências da T01.
3. Execução de uma única tarefa de `tasks.md` por vez.

## Riscos e controles

- **Concorrência no limite de três itens:** a Service usará transação e bloqueio
  por membership; o índice parcial continuará protegendo o equipamento.
- **Relações cruzadas entre tenants:** chaves estrangeiras compostas incluem
  `tenant_id`.
- **RLS recursiva em memberships:** funções auxiliares `SECURITY DEFINER`
  consultarão membership com `search_path` fixo e permissões restritas.
- **Divergência Prisma/SQL:** toda extensão manual ficará no `migration.sql` da
  mesma migration Prisma.
- **Perda de histórico:** exclusões de equipamentos e memberships referenciadas
  serão restritas.

