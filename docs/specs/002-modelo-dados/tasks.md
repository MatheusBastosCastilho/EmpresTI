# Tarefas — Modelo de dados inicial

Cada tarefa cabe em um commit do usuário. O agente executará somente uma tarefa
por autorização e parará após os checks e o handoff.

## T01 — Configurar Prisma e conexão local

**Critérios:** preparação para CA-01 e CA-09  
**Pré-condição:** plano e DDL aprovados; instalação de dependências autorizada.

- Instalar Prisma e cliente Prisma.
- Criar configuração e schema vazios.
- Criar o contrato de variáveis sem expor segredos.
- Validar conexão exclusivamente com o Supabase local.

## T02 — Criar a migration inicial do domínio

**Critérios:** CA-01 a CA-07  
**Pré-condição:** DDL aprovado.

- Modelar enums, tabelas e relações.
- Gerar uma migration Prisma.
- Acrescentar índices, triggers, RLS, policies e funções auxiliares na mesma
  migration.
- Aplicar somente no banco local.
- Testar a recriação do schema do zero.

## T03 — Criar o seed inicial

**Critérios:** CA-08, CA-09

- Criar seed idempotente do tenant `suporte_ti`.
- Criar categorias iniciais.
- Provar que duas execuções não duplicam dados.

## T04 — Testar integridade e multi-tenancy

**Critérios:** CA-02 a CA-07, CA-10

- Adicionar testes de constraints e índices.
- Adicionar testes de devolução e auditoria append-only.
- Adicionar testes de RLS entre dois tenants.
- Executar os testes contra PostgreSQL real local.

## T05 — Validar reconstrução completa

**Critérios:** CA-01 a CA-10

- Recriar o banco local do zero com Prisma Migrate.
- Executar seed, testes, lint e build.
- Verificar ausência de segredos e alterações fora do escopo.
- Atualizar o handoff.

