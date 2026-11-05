# Plano — fechamento das aulas 7 e 8

Data: 05/11/2026. Status: aguardando aprovação do recorte e das dependências.
Prazo solicitado: 10h de São Paulo. Fontes: HTMLs preservados em
`docs/referencias/aulas/`. Este plano não inclui concluir o produto inteiro.

## Recorte e tarefas verificáveis

1. **Documentos da aula 7:** cinco perguntas classificadas e justificadas;
   conferir os doze itens do ADR-001, alternativas e o que ele não decide.
2. **Critérios do andar zero:** registrar AZ-01 a AZ-08 em `docs/andar-zero.md`,
   sem transformar infraestrutura em spec de produto; mapear evidências reais.
3. **Configuração e conexão:** validar variáveis com Zod e usar o Prisma existente
   com adapter PostgreSQL; consulta deve tocar uma tabela criada por migration.
   Dependências propostas: `@prisma/adapter-pg@7.10.0`, `pg` e `zod`, já previstos no ADR-001.
4. **Endpoint:** `GET /health`, público, somente status da conexão; 200 saudável,
   503 indisponível; sem credenciais, detalhes de exceções ou dados do domínio.
5. **Página:** `/andar-zero` consome `/health` e mostra o estado da conexão e
   falhas de forma legível; não altera o formulário de login já publicado.
6. **Execução reproduzível:** comando único instala pelo lockfile, inicia Supabase
   local, aplica migrations, gera cliente e sobe a aplicação; comando de parada
   e modo isolado de verificação com banco vazio sem tocar o remoto.
7. **Testes:** status e corpo do endpoint, banco local de teste separado do dev,
   indisponibilidade/configuração inválida e consulta real; suite em um comando.
8. **Documentação final:** atualizar AGENTS.md com comandos executados, mapa real,
   convenções e como testar; registrar decisões de infraestrutura e rascunho de
   login real com perguntas classificadas e garantias herdadas do andar zero.
9. **Validação e ZIP:** reconstrução em ambiente local isolado, testes, lint,
   build e conferência HTTP; registrar evidências e gerar ZIP do repositório
   atual, sem `.env` reais, `.git`, dependências, caches ou builds.

Cada tarefa terá verificação própria; commits novos separados por recorte.
Não reescrever o histórico remoto para simular a ordem didática da aula.

## Organização proposta

- `src/server/env.ts`, `src/server/db.ts`: configuração e Prisma somente no servidor.
- `app/health/route.ts`: health check de infraestrutura, sem regra de negócio.
- `app/andar-zero/`: página mínima que consome o endpoint.
- `scripts/`: subida, parada e testes isolados de infraestrutura.
- `tests/`: testes reais de integração do health check.
- `docs/`: documentos e evidências, com referências às aulas.

O health check é um Route Handler de infraestrutura exigido pela aula; não cria
um segundo caminho de API de domínio. As futuras funcionalidades continuam com
Router tRPC → Service → Prisma conforme ADR-001.

## Limites e transparência

O checkout já contém login demonstrativo e schema de domínio anteriores à
conferência das aulas. Eles serão preservados, sem alegar que o histórico antigo
seguiu a ordem didática. A atividade fecha com o andar zero verificável e a
primeira spec rascunhada; autenticação real e demais telas não pertencem a ela.
Não aplicar novas migrations remotas, não redefinir senha e não alterar produção.
