# Plano de continuidade

Data: 23/10/2026. Status: proposta; implementação das próximas funcionalidades
depende de aprovação do plano, conforme `rules/restrictions.md`.

Integrações e recorte dev autorizados. DDL dev aprovado em 23/10/2026.
O usuário determinou reutilizar o projeto Supabase existente
`puwkfemwkgsmmfjdqdgq`, em Oregon (`us-west-2`), em vez de criar outro em São Paulo.
Essa escolha específica substitui a região prevista no ADR-001 para este setup.
Vercel já conectada ao nosso GitHub, produção acompanhando `main`.

A base dev terá histórico próprio em `prisma/migrations-dev`, configurado pelo
Prisma Migrate. O histórico importado em `prisma/migrations` permanece intacto
como referência e não será reaplicado no projeto remoto. O schema `auth` é externo.

Em 05/11/2026, a base dev foi reconstruída localmente, passou pelo smoke SQL e
foi aplicada no projeto remoto escolhido. Foram verificadas seis tabelas com
RLS, 14 policies, `auth` preservado e nenhuma tabela em `public`. O ambiente dev
do GitHub e seu secret estão configurados; o fluxo manual depende de publicação.
Procedimento e limites em `setup-dev.md`. A prova página → endpoint → banco e
a autenticação real continuam pendentes; essa etapa não conclui o produto.

## Objetivo

Conectar nosso repositório aos serviços próprios e concluir a primeira versão
do PRD: autenticação, catálogo, empréstimos, devoluções e Operações.

Repositório: https://github.com/MatheusBastosCastilho/EmpresTI.
Vercel existente: projeto `empres-ti`, workspace `matbastoscastilho-8909`.
Referências externas e diferenças: `referencias/gabriel/README.md`.

## Etapa 1 — Integrações e prova da stack

1. Conectar o projeto Vercel existente ao nosso GitHub, preservando seu domínio.
   Confirmar branch de produção `main` e previews nas branches de trabalho.
   Verificar build e login no endereço existente após a conexão.
2. Identificar a organização Supabase da conta do usuário e seus recursos
   existentes antes de criar outro projeto. Criar somente no plano gratuito,
   na região São Paulo prevista no ADR-001; parar se houver cobrança ou quota.
3. Preparar banco local e revisar a migration existente. O Docker está instalado,
   mas o daemon estava parado na inspeção inicial.
4. Reconciliar o schema atual `public` com a restrição de usar somente `dev`
   no Supabase remoto. Propor adaptação versionada antes de aplicar migrations.
   Não substituir texto em migrations já aplicadas nem mover objetos de Auth.
5. Definir e validar variáveis privadas localmente e por ambiente na Vercel.
   Chaves públicas podem ir ao cliente; URLs PostgreSQL e chaves de serviço não.
   Nunca incluir valores no Git, logs ou documentação.
6. Provar página → endpoint → PostgreSQL → resposta, com migration e teste
   automatizado, registrando evidência dos critérios AZ-01 a AZ-08 das aulas.

Conexão do banco ao Git significa versionar schema, migrations e seed e
automatizar verificações. Não significa enviar dados ou credenciais ao GitHub.
A integração nativa de branches do Supabase precisa ser avaliada separadamente
quanto a necessidade, custo e permissões; não é requisito para Prisma Migrate.

Aceite: vínculo Git da Vercel verificado; banco e ambientes identificados;
reconstrução local reproduzível; health check comprova acesso ao banco;
nenhuma migration de produção, nenhuma credencial versionada.

## Etapa 2 — Concluir e verificar o modelo de dados

Retomar `docs/specs/002-modelo-dados/`: conferir T01/T02 existentes, preparar
seed idempotente T03 e executar T04/T05. Provar isolamento entre tenants,
constraints, empréstimo único por equipamento e auditoria. Validar a regra
de três itens e bloqueio por atraso em transações ao implementar o Service.

## Etapa 3 — Autenticação real

Criar spec e plano próprios, pois a entrega atual é demonstrativa. Usar Supabase
Auth, cadastro fechado, cookies conforme ADR-001, proteção de rotas e contexto
tRPC com tenant resolvido da sessão. Definir antes da implementação destino
após login, mensagens de falha, logout, expiração, recuperação de senha e
provisionamento do primeiro usuário de Operações.

## Etapa 4 — Interface e funcionalidades do PRD

Retomar shell T02 e telas T04 a T08 da interface inicial. Separar os critérios
demonstrativos da integração real com os Services; revisar specs antes de
substituir dados fictícios. Entregar em fatias verificáveis:

1. Catálogo e detalhe com disponibilidade real.
2. Solicitação imediata, prazo de 14 dias, limite de três e bloqueio por atraso.
3. Meus empréstimos, histórico e devolução pelo colaborador.
4. Operações: empréstimos abertos, devolução no balcão e cadastro de equipamentos.

Manter os estados e regras locais: sem aprovação de empréstimo, reserva futura,
notificação por e-mail ou importação de planilha.

## Etapa 5 — Verificação e entrega

Executar testes de regras, integração PostgreSQL, isolamento por procedimento,
lint, build e E2E dos fluxos críticos. Confirmar ausência de segredos e políticas
de acesso antes de liberar usuários. Promoção e migrations de produção exigem
pedido específico. Registrar o resultado e próximo passo em `handoff.md`.

## Execução

Uma tarefa de implementação por autorização, com checks e handoff, conforme as
regras vigentes. Não instalar dependências nem aplicar migrations nesta etapa
de levantamento. Commit e push continuam com o usuário salvo autorização
específica, como ocorreu na criação inicial do repositório.
