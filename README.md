# EmpresTI

Entrega acadêmica das aulas 7 e 8: documentos de SDD e andar zero verificável.
O [checklist e as evidências](docs/entrega-aulas.md) mapeiam as exigências dos
HTMLs aos arquivos e comandos. O produto completo ainda não está implementado;
o login existente continua demonstrativo.

## Pré-requisitos

- Node.js 24 com npm.
- Docker Desktop iniciado, com containers Linux habilitados.
- Internet na primeira execução para dependências, imagens e fontes.
- Portas 3000, 54321 e 54322 livres. Não são necessárias credenciais remotas.

## Subir uma cópia limpa

Na pasta que contém este README:

```sh
npm run up
```

O único comando instala pelo lockfile se necessário, cria `.env` com conexão
padrão exclusivamente local, inicia PostgreSQL/Supabase, gera o cliente Prisma,
aplica migrations pendentes e inicia o Next. Não redefine senhas nem conecta ao
Supabase remoto. Se já houver `.env`, exige que ele aponte para o destino local.

Abra [a prova do andar zero](http://localhost:3000/andar-zero). Ela consulta
`GET /health`, que lê uma tabela criada pela migration sem retornar dados do
domínio. Saudável: HTTP 200, `{"status":"ok","database":"connected"}`.
Indisponível/configuração inválida: HTTP 503 com mensagem genérica, sem segredo.

Ctrl+C encerra a aplicação. Para parar os serviços locais, preservando os dados:

```sh
npm run down
```

A reconstrução do zero é exercitada em containers descartáveis de teste,
sem apagar o banco de desenvolvimento.

## Testar e compilar

```sh
npm test
npm run lint
npm run build
```

`npm test` cria PostgreSQL real isolado com Testcontainers, aplica a migration,
executa o smoke de constraints/RLS e a suíte Vitest e remove o container ao fim.
Não usa o banco dev nem o remoto. Auth nessa suíte é apenas o contrato SQL externo
necessário às FKs; não é teste de autenticação de usuários.

O build gera o cliente Prisma antes do Next e não precisa acessar um banco.
O cliente gerado, dependências, `.env` reais e builds não são versionados.

## Documentos para avaliação

- [Cinco perguntas e conferência da stack](docs/perguntas-prd.md).
- [ADR-001 aceito e alternativas](docs/adr/001-stack.md).
- [AZ-01 a AZ-08](docs/andar-zero.md) e [plano](docs/plan-andar-zero.md).
- [Revisão da organização](docs/revisao-estrutura.md).
- [Rascunho da primeira funcionalidade real](docs/specs/003-login-real/spec.md).
- [Materiais originais e atribuição](docs/referencias/README.md).
- [Setup do dev remoto e GitHub](docs/setup-dev.md).

## Estado do produto e hospedagem

[Login publicado](https://empres-ti-beryl.vercel.app/login): validação local,
mostrar/ocultar senha e envio demonstrativo; não autentica nem persiste credenciais.
O Supabase próprio já tem schema dev, e o GitHub possui workflow manual de
migrations. O projeto Vercel está ligado ao repositório próprio.

O endpoint e a página do andar zero são verificados localmente nesta atividade.
Não há alteração de banco ou configuração de produção nesta entrega.

## ZIP

Contém fontes, lockfile, migrations, testes, documentos, materiais das aulas,
manifesto de integridade e log Git. Não contém `.git`, `.env` reais, dependências,
cliente gerado nem `.next`. Após extrair, execute `npm run up`.
