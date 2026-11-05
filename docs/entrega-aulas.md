# Entrega — aulas 7 e 8 de EmpresTI

Data: 05/11/2026, São Paulo. Fontes originais em `referencias/aulas/`.
Recorte aprovado pelo usuário: fechar os documentos, provar o andar zero e
entregar o repositório local em ZIP. Não é entrega do produto inteiro.

## Aula 7

| Exigência | Entrega |
| --- | --- |
| Cinco perguntas, tipo e relevância | `perguntas-prd.md` |
| Stack com os doze itens | `adr/001-stack.md` |
| Justificativas e alternativas descartadas | Tabelas e alternativas do ADR-001 |
| O que o ADR não decide | Seção final do ADR-001 |
| Segredos fora de documentos e fontes | `.gitignore`, `.env.example` e inspeção do pacote |

## Aula 8 — andar zero

| Critério | Evidência executada |
| --- | --- |
| AZ-01 | `npm run up`: prepara o Supabase, gera Prisma, aplica migrations e inicia Next; `/andar-zero` respondeu 200 |
| AZ-02 | `/health` respondeu 200 com banco ativo; após `npm run down`, respondeu 503 com mensagem genérica |
| AZ-03 | `npm test` criou PostgreSQL novo e aplicou a migration inicial antes de consultar a tabela |
| AZ-04 | HTTP 200 com `status=ok` e `database=connected`, consultando `dev.tenants` |
| AZ-05 | Navegador mostrou “Banco conectado” e o JSON do endpoint; imagem em `evidencias/andar-zero.jpg` |
| AZ-06 | `npm test`: 7 testes em 3 arquivos passaram, com banco real descartável; smoke de constraints/RLS passou |
| AZ-07 | Zod valida `DATABASE_URL`; `.env.example` versionado e sem valores; teste de configuração inválida passou |
| AZ-08 | Arquivos privados ignorados; ZIP exclui segredos, `.git`, dependências, builds e cliente gerado |

O teste em ambiente limpo foi realizado com PostgreSQL descartável, banco vazio,
roles mínimas e migrations aplicadas do zero. Não é alegada uma execução física
em outro computador. Node 24, npm, Docker Linux e internet são pré-requisitos.

## Comandos e respostas observadas

- `npm test`: `Test Files 3 passed (3)`; `Tests 7 passed (7)`.
- `npm run build`: compilação e TypeScript passaram; rotas `/andar-zero`, `/health` e `/login` presentes.
- ESLint: terminou sem erros após correções de tipagem e efeito React.
- `npm run up`: servidor pronto em `http://localhost:3000`, sem migrations pendentes.
- `npm run down`: serviços parados com dados preservados.
- HTTP sem banco: `503`, `status=error`, `database=unavailable`, sem detalhes de conexão.

Uma primeira tentativa concorrente com o build teve timeout de worker. A execução
sequencial completa passou. Um primeiro build detectou uma tipagem de teste e o
lint detectou atualização síncrona em efeito; ambos foram corrigidos e os checks
repetidos passaram. Não foi considerado sucesso enquanto havia check vermelho.

## Organização e AGENTS v1

O mapa real, comandos executados, convenções e forma de testar estão em
`../AGENTS.md`. Revisão das pastas e arquivos legados em `revisao-estrutura.md`.
App Router é convenção do framework; infraestrutura fica em `src/server`, e as
futuras regras de negócio continuarão com tRPC → Service → Prisma.

Decisões explicitadas no plano aprovado: health público e sem cache; 503 genérico
na falha; consulta a tabela migrada sem retornar registros; teste isolado; cliente
Prisma gerado; defaults apenas para desenvolvimento local e geração sem conexão.
Essas convenções estão registradas no plano, no contrato do andar zero e no AGENTS.

## Rascunho da primeira funcionalidade

`specs/003-login-real/spec.md` escolhe e justifica login, define objetivo, vínculo,
regras, critérios identificados, fora de escopo, contrato afetado, perguntas por
tipo e garantias herdadas do andar zero. A numeração preserva as duas specs já
existentes, em vez de renomear o histórico para parecer um projeto novo.

## Transparência sobre o histórico

Este checkout foi importado com scaffold, login demonstrativo e domínio já
existentes, antes desta conferência. Portanto o histórico antigo não reproduz a
ordem didática ideal, nem a pasta de specs está vazia. Não se reescreveu história,
não se removeu código aprovado e não se atribuiu ao agente o material do professor.
Os novos recortes têm commits separados. O ZIP inclui o log real para avaliação.

## Fora desta entrega

Autenticação real, convites, recuperação de senha, catálogo e empréstimos pela
interface, Services de negócio e prova de operação institucional continuam para
as próximas aulas. O login publicado permanece demonstrativo. Nenhuma nova
migration remota nem alteração de produção foi executada nesta atividade.

## Pacote

`EmpresTI-entrega-2026-11-05.zip`, na pasta Downloads. Contém fontes atuais,
lockfile, testes, migrations, materiais e documentos, imagem, manifesto SHA-256 e
log Git. Os arquivos são conferidos contra o manifesto depois da compressão.
Após extrair, abrir `EmpresTI/README.md` e executar `npm run up`.
