# Aula 7 — cinco perguntas que o PRD não responde

As respostas já decididas no projeto são apontadas para preservar a rastreabilidade;
as perguntas sem resposta permanecem abertas, sem inventar regra de negócio.

1. **O empréstimo precisa de aprovação de Operações?**
   Tipo: negócio. Por que importa: muda estados, permissões e início do prazo.
   Resposta já confirmada: não; a confirmação cria o empréstimo imediatamente,
   conforme `specs/002-modelo-dados/spec.md`.
2. **O colaborador registra a devolução ou apenas a solicita?**
   Tipo: negócio. Por que importa: define quando o equipamento volta a ficar disponível.
   Resposta já confirmada: colaborador e Operações podem registrar a devolução;
   guardar ator e horário, conforme a spec de modelo de dados.
3. **Como identificar a pessoa e separar os dados das organizações?**
   Tipo: técnica. Por que importa: afeta sessão, autorização e segurança de todas as consultas.
   Decisão: Supabase Auth, membership por tenant e autorização no tRPC, em ADR-001.
4. **Quais campos identificam um equipamento e como são únicos?**
   Tipo: negócio. Por que importa: evita duplicidade de patrimônio e empréstimo do item errado.
   Resposta já confirmada: patrimônio obrigatório e único por tenant; número de
   série opcional, conforme a spec de modelo de dados.
5. **Recuperação de senha entra na primeira versão?**
   Tipo: fora de escopo a confirmar. Por que importa: adiciona fluxo, mensagens e
   configuração de e-mail que o PRD não descreve. Permanece pergunta no rascunho
   de autenticação; não foi implementada nem decidida pelo agente.

## Conferência dos doze itens da stack

O ADR-001 aceito cobre linguagem/runtime, framework, API, front-end, mesma origem,
autenticação, autorização, ORM, migrations, testes, execução local e configuração.
Registra justificativas, alternativas descartadas, consequências e a seção
“O que este ADR não decide”. O banco é PostgreSQL, como exige a aula.
