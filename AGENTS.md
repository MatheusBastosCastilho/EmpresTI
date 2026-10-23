# EmpresTI

Sistema web interno para controlar empréstimos de equipamentos usados por colaboradores e pela equipe de Operações.
Negócio em `docs/prd.md`. Stack decidida em `docs/adr/001-stack.md`.

## Onde olhar

- `docs/prd.md` — o que o negócio precisa. Não é uma spec e tem a maior precedência.
- `docs/adr/` — decisões técnicas já tomadas e os motivos delas.
- `docs/layout.md` — regras visuais, componentes e telas do produto.
- `docs/specs/<NNN-funcionalidade>/` — spec, plano e tarefas de cada feature, quando essa estrutura existir.
- `rules/` — como se trabalha aqui, quando essa estrutura existir. Leia `rules/restrictions.md` sempre que o arquivo estiver disponível.
- Ignore `docs/stack_H.md`; ele é um rascunho histórico.

## Comandos

- `npm run lint` — valida o código com ESLint.
- `npm test` — executa os testes uma vez com Vitest.
- `npm run build` — gera o build de produção do Next.js.

Só registre nesta seção comandos que já tenham sido executados com sucesso neste ambiente.

## Ambiente

- Banco: Supabase. O desenvolvimento acontece no banco local.
- Deploy: Vercel, ligada ao repositório remoto. Push publica.
- A configuração vem de variáveis de ambiente.
- O arquivo `.env` existe localmente, mas `.env.example` ainda não existe.
- Segredos não podem ser expostos no código cliente nem em arquivos versionados.

## Precedência

- `docs/prd.md` tem a maior precedência para requisitos e regras de negócio.
- Se uma spec de feature e o código discordarem sobre comportamento, a spec vence o código, desde que não contrarie o PRD.
- O ADR aceito orienta decisões técnicas quando o PRD e a spec não determinarem algo.
- `docs/layout.md` orienta as decisões visuais quando o PRD e a spec não determinarem algo.
- Se algo não estiver escrito em lugar nenhum ou estiver ambíguo, pergunte antes de decidir ou codificar.

## Estado atual do projeto

- Existe um scaffold Next.js com App Router, TypeScript strict, Tailwind CSS e componentes-base do shadcn/ui.
- Existe configuração de Vitest e Testing Library com um teste do componente Button.
- A interface das telas ainda não foi implementada; a execução parou ao concluir a T01 de `docs/specs/001-interface-inicial/tasks.md`.
- Ainda não existem integrações, acesso a banco, migrations nem `.env.example`.
- Existem `docs/specs/` e `rules/`.
- Este checkout ainda não possui remoto Git configurado nem vínculo local em `.vercel/project.json`.

## Procedimentos
