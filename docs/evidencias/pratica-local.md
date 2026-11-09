# Evidências locais da prática

Rodadas de 09/11/2026, com Supabase local e PostgreSQL descartável.

| Critérios | Observação |
| --- | --- |
| LOGIN-01 a LOGIN-06 | Em HTTP, a conta sem vínculo recebeu 401 e nenhum cookie. A conta com vínculo entrou e recebeu cookie HttpOnly. Entrada de outro tenant foi rejeitada. A rodada de regressão devolveu 401 ao reapresentar o mesmo cookie após o logout. |
| LOGIN-07 | A renovação real do token atualizou a emissão do JWT e preservou o horário da autenticação por senha. O teste aplica o teto de oito horas a partir desse horário. |
| LOGIN-08 | PostgreSQL descartável, seis reservas concorrentes para a mesma conta. Apenas cinco passaram. O teto por IP e a expiração de 15 minutos também passaram. |
| Spec 004, CA-01 a CA-04 | Duas execuções no banco de teste preservaram 12 patrimônios, quatro categorias, o empréstimo de outra conta e o estado operacional existente. O vínculo docente descartável ficou sem empréstimos. A conta docente do deploy ainda depende do operador. |
| Spec 004, CA-05 | Os 12 JPEGs aprovados têm 800×600, IDs e hashes distintos. Os hashes do ZIP e dos objetos do Storage local conferem com o manifesto. O upload ao Storage do deploy está pendente. |
| Spec 005, CA-01 a CA-06 | O fluxo HTTP exibiu 12 itens e o crédito, bloqueou acesso anônimo, criou o empréstimo, retornou vencimento e recusou a repetição com 409. Os testes PostgreSQL cobriram isolamento, limite, atraso e as duas corridas. |
| Spec 005, CA-07 | O HTML apontou ao Storage pelo caminho do manifesto. Os 12 caminhos públicos do bucket local responderam HTTP 200, com MIME JPEG e bytes iguais aos hashes aprovados. As URLs do deploy ainda aguardam upload e validação. |

Para repetir a regressão de sessão, suba os serviços locais com
`node scripts/local.mjs up --services-only` e rode
`node scripts/test-logout-local.mjs`. O teste usa uma conta descartável e
remove seus dados ao finalizar. `npm test` executa a suíte isolada.
