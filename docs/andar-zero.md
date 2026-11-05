# Andar zero — prova do ADR-001

Isto não é uma spec: não há comportamento de produto aqui. É a verificação de
que a stack decidida em `adr/001-stack.md` funciona junta num ambiente limpo.
Fonte dos critérios: aula 8, preservada em `referencias/aulas/`.

## Critérios de aceitação

- AZ-01: um comando único sobe a aplicação e o PostgreSQL do zero.
- AZ-02: a aplicação conecta no banco; sem banco, apresenta erro claro e imediato.
- AZ-03: existe uma migration versionada e aplicada.
- AZ-04: GET `/health` devolve 200 e o status da conexão com o banco.
- AZ-05: uma página do front carrega e mostra o resultado de `/health`.
- AZ-06: um comando roda os testes; existe teste sobre status e corpo de `/health`.
- AZ-07: configuração por variável de ambiente, com `.env.example` versionado.
- AZ-08: `.env` real no `.gitignore`; nenhum segredo no repositório.

## Fora de escopo

Implementar login real, catálogo, empréstimo, devolução ou outras regras do PRD.
O login demonstrativo e o schema de domínio que já existiam são preservados;
esta atividade não acrescenta funcionalidades de produto nem apaga o histórico.

## Organização

O plano aprovado está em `plan-andar-zero.md`. App Router é a convenção do Next;
infraestrutura do servidor fica em `src/server`, isolada dos componentes cliente.
O mapa dos diretórios efetivamente existentes fica no `AGENTS.md`.

## Evidências

Resultados, comandos e limitações da reconstrução são registrados em
`entrega-aulas.md`. Um critério só é marcado como atendido depois da execução.
