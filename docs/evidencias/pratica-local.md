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

## Validação na Vercel em 09/11/2026

Revisão publicada `5e26c66607bd1a344daad018e70a04b4f8b24573`.

| Critério | Resultado observado |
| --- | --- |
| Login | `/health` respondeu 200. `/catalogo` sem sessão redirecionou a `/login`. A conta docente entrou com a senha padrão do enunciado original, abriu o catálogo e encerrou a sessão. O cadastro público está desativado no Supabase. |
| Spec 004, CA-01 a CA-05 | Duas execuções do seed preservaram 12 patrimônios e três itens em manutenção. A conta docente é colaboradora de `suporte_ti` e tem zero empréstimos. Os 12 objetos públicos correspondem aos hashes do manifesto. |
| Spec 005, CA-01 a CA-04 e CA-06 | Uma conta separada solicitou TI-0001, TI-0002 e TI-0003. Cada empréstimo apareceu na lista com devolução em 23/11/2026 e deixou de ser solicitável. TI-0004 não apresentou botão de solicitação. A quarta tentativa, para TI-0005, recebeu a mensagem de limite. O banco confirmou o prazo de 14 dias e três registros `loan.requested`. |
| Spec 005, CA-07 | O catálogo autenticado exibiu 12 patrimônios e 12 referências às fotos do Storage público. |

O encerramento operacional no schema `dev` liberou os três itens de teste e
registrou três eventos `loan.test_closed`, preservando o histórico. Ao final,
havia nove itens disponíveis, três em manutenção e zero empréstimos docentes.

O verificador avaliou o snapshot `ab4f69f35b78d799ca368f204cf5c4da6e7ad70e`
contra `8dc5782`. Aprovou LOGIN-01 a LOGIN-08 e CA-01 a CA-07 da spec 005.
Na spec 004, aprovou CA-01, CA-02, CA-04 e CA-05. CA-03 ficou sem evidência
da entrega privada da credencial, embora o vínculo e os zero empréstimos
tenham sido confirmados no deploy.

Após alinhar CA-03 ao enunciado, o verificador aprovou os cinco critérios da
spec 004 no snapshot `3226edd03d6d10d84ffa6eace6b01fe8cdf4c071`.
