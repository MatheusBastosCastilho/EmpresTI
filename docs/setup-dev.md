# Banco dev e integração com GitHub

## Estado verificado em 05/11/2026

- Projeto Supabase existente: `puwkfemwkgsmmfjdqdgq`, região Oregon (`us-west-2`),
  reutilizado por decisão do usuário.
- Migration `20261023134345_initial_dev` aplicada localmente e no schema remoto `dev`.
- Seis tabelas com RLS e 14 policies; `auth.users` preservada; nenhuma tabela em `public`.
- Reconstrução local por Prisma Migrate e smoke SQL passaram.
- A migration original de `public` continua intacta em `prisma/migrations`.
- Histórico ativo: `prisma/migrations-dev`, definido em `prisma.config.ts`.
- Ambiente `dev` criado no GitHub, limitado à branch `main`, com secret `DIRECT_URL`
  configurado pela API usando criptografia sealed box. O valor não foi versionado.
- Quatro testes de componentes, lint e build passaram. Nesta máquina, os testes
  passaram com `vitest run --pool=threads --maxWorkers=1 --no-isolate`, após um
  timeout de inicialização de worker durante execução concorrente com o build.
- Nove checagens do script de deploy confirmaram aceitação de dev e rejeição de
  outros schemas/projetos, porta transacional, TLS desabilitado e redirecionamentos.

## Conexões e segredos

`.env` aponta para o Supabase local. `.env.remote-dev` contém a conexão privada
do projeto remoto. Ambos são ignorados pelo Git; `.env.example` registra apenas
nomes, sem valores. Nunca copie o conteúdo dos arquivos privados para o chat,
um commit ou um log.

O host direto exige IPv6 e não resolveu nesta máquina. Foi usado o Session
pooler na porta 5432, com `schema=dev` e `sslmode=require`, conforme a
[documentação do Prisma no Supabase](https://supabase.com/docs/guides/database/prisma).
Essa conexão fica fora do pool transacional, preservando sessões para migrations.

O login publicado continua demonstrativo. Nenhuma variável de banco foi
cadastrada na Vercel nesta tarefa; conectar a aplicação ao banco é uma próxima
fatia, com autenticação e acesso a dados conforme o ADR-001.

## Executar migrations dev

Com Node.js 24 e as dependências do lockfile instaladas:

```sh
node scripts/deploy-dev.mjs --check
node scripts/deploy-dev.mjs
```

O script aceita exclusivamente o projeto autorizado no Session pooler, porta
5432, schema `dev` e TLS. Rejeita schemas alternativos, hosts diferentes e
parâmetros que possam redirecionar a conexão. Só executa `prisma migrate deploy`;
não executa reset. A opção `--check` não conecta no banco.

Mudanças futuras de schema continuam exigindo revisão do DDL, geração e testes
locais antes da aplicação remota. Não editar migrations compartilhadas.

## Ativar o fluxo no GitHub

O workflow `.github/workflows/dev-database.yml` está preparado para execução
manual na branch `main`; ele não executa migrations em pushes ou pull requests.

1. Revisar e integrar o PR da branch `docs/planejamento-integracoes`.
   O usuário autorizou o agente a fazer commit e push deste recorte em 05/11/2026.
2. O ambiente `dev` e seu secret `DIRECT_URL` já estão configurados. Se a senha do
   banco mudar, atualizar o arquivo privado e esse secret, sem versionar o valor.
3. Em Actions → Migrations do banco dev, escolher Run workflow na branch `main`.
4. Conferir o resultado do Prisma Migrate. A migration já aplicada será reconhecida
   pelo histórico; somente novas migrations pendentes serão executadas.

O workflow ainda precisa ser publicado; sua execução no GitHub não foi verificada
nesta tarefa. A conexão nativa de branching do Supabase
não foi habilitada: o dono do schema permanece sendo Prisma Migrate.

## Verificação local do banco

```powershell
Get-Content -Raw prisma/tests/dev-smoke.sql |
  docker exec -i supabase_db_Emprestimo psql -U postgres -d postgres -v ON_ERROR_STOP=1
```

O smoke cria fixtures temporárias e faz rollback. Verifica RLS, isolamento entre
tenants, exclusividade de empréstimo aberto, referências entre tenants e prazo
de 14 dias. Execute somente no Supabase local. Não é a suíte completa de Services
nem substitui os testes das próximas funcionalidades.
