# Stack â€” base para o ADR-001 (turma B)

Documento de trabalho. Serve de insumo para `docs/adr/001-stack.md`.
Cada item tem escolha e uma linha de justificativa, no formato que o ADR espera.

---

## 1. Arquitetura e repositÃ³rio

| Item | Escolha |
|---|---|
| Arquitetura | Monolito |
| AplicaÃ§Ã£o | Next.js (App Router), front e servidor no mesmo projeto |
| RepositÃ³rio | Ãšnico |
| Deploy | Um projeto na Vercel |
| Camada de servidor | Route Handlers do Next, sem servidor separado |

- **Monolito** â€” nÃ£o hÃ¡ equipe separada para front e back nem necessidade de escalar as partes de forma independente; separar criaria dois deploys, dois CI e uma fronteira HTTP para manter sem ganho.
- **Next.js App Router** â€” o servidor mora dentro do mesmo projeto do front, entÃ£o a chamada de dados nÃ£o atravessa domÃ­nio nem exige CORS.
- **RepositÃ³rio Ãºnico** â€” o tipo do procedimento e o tipo consumido na tela sÃ£o o mesmo sÃ­mbolo TypeScript; em repositÃ³rios separados isso viraria arquivo gerado.
- **"Monolito" Ã© de cÃ³digo, nÃ£o de processo** â€” na Vercel cada rota vira uma function; o que Ã© Ãºnico Ã© o codebase e o deploy, nÃ£o o runtime.

---

## 2. Camada de apresentaÃ§Ã£o

| Item | Escolha |
|---|---|
| Linguagem | TypeScript em modo `strict` |
| RenderizaÃ§Ã£o | Client Components como padrÃ£o para telas com dados |
| Estado de servidor | TanStack Query via `@trpc/react-query` |
| Estado de cliente | `useState` e Context; sem biblioteca de store |
| FormulÃ¡rios | React Hook Form + `zodResolver` |
| EstilizaÃ§Ã£o | Tailwind CSS |
| Componentes | shadcn/ui |

- **TypeScript `strict`** â€” sem `strict` o tipo que vem do tRPC nÃ£o pega os casos de nulo, que sÃ£o exatamente os que quebram em produÃ§Ã£o.
- **Client Components como padrÃ£o** â€” misturar Server Components buscando dados direto no Prisma com tRPC buscando pelo cliente cria dois caminhos de acesso a dado, com duas checagens de permissÃ£o para manter em sincronia. Um caminho sÃ³ Ã© mais fÃ¡cil de auditar.
- **TanStack Query pelo adapter do tRPC** â€” cache, revalidaÃ§Ã£o e estado de loading jÃ¡ vÃªm resolvidos e tipados a partir do procedimento; escrever isso por tela Ã© a maior fonte de bug repetido.
- **Sem biblioteca de store** â€” depois do TanStack Query sobra pouco estado de cliente (filtro, modal, wizard), e isso cabe em `useState`.
- **React Hook Form + zodResolver** â€” o mesmo schema Zod que valida a entrada do procedimento valida o formulÃ¡rio, entÃ£o a regra Ã© escrita uma vez.
- **Tailwind** â€” o design vem do Figma e precisa ser reproduzido de perto; biblioteca com visual prÃ³prio brigaria com isso.
- **shadcn/ui** â€” copia o componente para dentro do repositÃ³rio em vez de esconder atrÃ¡s de API de biblioteca, entÃ£o customizar nÃ£o vira luta contra a dependÃªncia.

---

## 3. Camada de servidor

| Item | Escolha |
|---|---|
| PadrÃ£o de API | tRPC |
| Endpoint | Route Handler em `app/api/trpc/[trpc]/route.ts` |
| OrganizaÃ§Ã£o | `src/server/api/routers/<dominio>.ts`, um router por domÃ­nio |
| Camadas | Router (procedimento) â†’ Service â†’ Prisma |
| ValidaÃ§Ã£o de entrada | Zod no `.input()` de todo procedimento |
| SerializaÃ§Ã£o | superjson |
| Contexto de request | SessÃ£o, `tenant_id`, `role` e cliente Prisma montados no `createContext` |
| Server Actions | NÃ£o usadas |

- **tRPC** â€” jÃ¡ era a decisÃ£o; mantida. Com front e servidor no mesmo TypeScript, o tipo do retorno chega na tela sem geraÃ§Ã£o de cÃ³digo nem contrato escrito Ã  mÃ£o.
- **Um router por domÃ­nio** â€” organizar por camada tÃ©cnica faz cada feature nova espalhar arquivo em pastas distantes; por domÃ­nio, a feature inteira fica junta.
- **Service separado do procedimento** â€” o procedimento cuida de entrada, contexto e permissÃ£o; a regra de negÃ³cio no service Ã© o que dÃ¡ para testar sem montar contexto de tRPC.
- **Zod em todo `.input()`** â€” Ã© o que o tRPC usa para tipar a entrada; sem ele o procedimento aceita `unknown` e a validaÃ§Ã£o vira `if` manual.
- **superjson** â€” sem transformer, `Date` e `Decimal` chegam como string na tela e cada componente refaz a conversÃ£o.
- **Contexto montado uma vez** â€” resolver sessÃ£o e tenant no `createContext` evita que cada procedimento repita a leitura do cookie, que Ã© onde alguÃ©m esquece e abre buraco.
- **Sem Server Actions** â€” seria um segundo caminho de mutaÃ§Ã£o, com outra forma de validar e outra de checar permissÃ£o; um caminho sÃ³ Ã© mais fÃ¡cil de auditar.

---

## 4. Contrato e tipos

| Item | Escolha |
|---|---|
| Fonte da verdade | O `AppRouter` do tRPC |
| Consumo no cliente | `RouterInputs` e `RouterOutputs` inferidos, sem tipo escrito Ã  mÃ£o |
| Versionamento | Nenhum |
| Formato de erro | `TRPCError` com cÃ³digo, tratado por `errorFormatter` |
| PaginaÃ§Ã£o de listas | Cursor, via `useInfiniteQuery` |
| Consumidor externo | Fora de escopo |
| Tempo real | Fora de escopo |

- **`AppRouter` como fonte da verdade** â€” mudar o retorno de um procedimento quebra o build da tela que o consome, na hora, sem passo de geraÃ§Ã£o.
- **Tipos inferidos** â€” declarar interface de resposta Ã  mÃ£o recria a duplicaÃ§Ã£o que o tRPC existe para eliminar.
- **Sem versionamento** â€” cliente e servidor sobem no mesmo deploy, entÃ£o nunca existem duas versÃµes em produÃ§Ã£o ao mesmo tempo.
- **`TRPCError` com `errorFormatter`** â€” dÃ¡ formato Ãºnico de erro para a tela tratar sem ler string de mensagem.
- **Cursor** â€” offset fica lento e duplica registro quando a lista recebe escrita concorrente; e o `useInfiniteQuery` jÃ¡ espera cursor.
- **Sem consumidor externo** â€” se um dia aparecer app mobile ou integraÃ§Ã£o de terceiro, tRPC nÃ£o serve e serÃ¡ preciso expor REST ao lado.
- **Sem tempo real** â€” function serverless nÃ£o mantÃ©m conexÃ£o aberta; atualizaÃ§Ã£o de tela Ã© polling do TanStack Query.

---

## 5. Dados e persistÃªncia

| Item | Escolha |
|---|---|
| Banco | PostgreSQL gerenciado pelo Supabase |
| ORM | Prisma |
| Dono do schema | Prisma Migrate (Ãºnico) |
| RLS, policies e triggers | SQL bruto dentro das migrations do Prisma |
| InstÃ¢ncia do Prisma | Singleton global, para sobreviver ao hot reload |
| ConexÃ£o de runtime | Supavisor, porta 6543, `?pgbouncer=true&connection_limit=1` |
| ConexÃ£o de migration | `directUrl`, porta 5432 |
| Seed | `prisma/seed.ts`, idempotente, cria o tenant `suporte_ti` |

- **Postgres no Supabase** â€” jÃ¡ era a decisÃ£o; mantida. Traz Auth e Storage sem eu operar servidor de banco.
- **Prisma** â€” jÃ¡ era a decisÃ£o; mantida. Tipagem gerada a partir do schema Ã© o que evita divergÃªncia entre modelo e cÃ³digo, e alimenta o tipo que o tRPC devolve.
- **Prisma Migrate como dono Ãºnico** â€” Prisma Migrate e Supabase CLI gerenciando o mesmo banco se sobrescrevem; ter dois donos de schema Ã© como o ambiente diverge de produÃ§Ã£o sem ninguÃ©m notar.
- **Policies em SQL na migration** â€” o Prisma nÃ£o modela RLS, policy nem trigger, entÃ£o esses objetos precisam entrar na mesma linha do tempo versionada, nÃ£o como script solto aplicado Ã  mÃ£o pelo painel do Supabase.
- **Singleton do Prisma** â€” em desenvolvimento o Next recarrega o mÃ³dulo a cada alteraÃ§Ã£o e, sem singleton, cada recarga abre um cliente novo atÃ© esgotar a conexÃ£o.
- **`connection_limit=1`** â€” obrigatÃ³rio em serverless, nÃ£o recomendaÃ§Ã£o: a Vercel escala instÃ¢ncias em paralelo e cada uma abrindo pool prÃ³prio esgota a conexÃ£o do projeto.
- **Seed idempotente** â€” seed que sÃ³ funciona em banco vazio nÃ£o serve para ambiente de teste que roda vÃ¡rias vezes.

---

## 6. Multi-tenancy

| Item | Escolha |
|---|---|
| Modelo | Tenant discriminado por coluna, banco Ãºnico |
| Coluna | `tenant_id` em toda tabela de domÃ­nio |
| VÃ­nculo usuÃ¡rioâ€“tenant | Tabela `memberships (user_id, tenant_id, role)` |
| Primeiro tenant | `suporte_ti`, criado no seed |
| Origem do tenant | Resolvido no `createContext` a partir da sessÃ£o, nunca do input |
| AplicaÃ§Ã£o do filtro | `tenantProcedure` injeta o `tenant_id` no service |

- **Coluna em banco Ãºnico** â€” schema por tenant multiplicaria cada migration pelo nÃºmero de tenants; para o escopo do projeto o isolamento lÃ³gico basta.
- **`tenant_id` em toda tabela** â€” tabela sem a coluna nÃ£o tem como ser protegida por policy e vira o buraco por onde o dado vaza.
- **Tabela de membership** â€” a mesma pessoa pode atuar em mais de uma Ã¡rea com papel diferente em cada; papel gravado no usuÃ¡rio nÃ£o representa isso.
- **Tenant vindo da sessÃ£o** â€” se o cliente manda o tenant no input do procedimento, trocar o valor Ã© toda a exploraÃ§Ã£o necessÃ¡ria.
- **Filtro por middleware, nÃ£o por chamada** â€” depender de cada service lembrar do `where: { tenantId }` Ã© depender de ninguÃ©m esquecer nunca.
- **Um tenant sÃ³ no inÃ­cio** â€” a estrutura existe desde o primeiro schema mesmo com um Ãºnico tenant, porque adicionar `tenant_id` depois exige backfill e revisÃ£o de toda query que toca a tabela.

---

## 7. AutenticaÃ§Ã£o e autorizaÃ§Ã£o

| Item | Escolha |
|---|---|
| Provedor de identidade | Supabase Auth, e-mail e senha |
| Cadastro | Fechado, somente por convite de administrador |
| IntegraÃ§Ã£o com o Next | `@supabase/ssr` |
| SessÃ£o no navegador | Cookie `httpOnly`, escrito pelo `@supabase/ssr` |
| RenovaÃ§Ã£o de sessÃ£o | Middleware do Next em toda rota |
| AutorizaÃ§Ã£o | Middlewares do tRPC: `protectedProcedure`, `tenantProcedure`, `adminProcedure` |
| RLS | Habilitado em todas as tabelas, deny by default |
| Papel do RLS | Defesa em profundidade, nÃ£o autorizaÃ§Ã£o primÃ¡ria |

- **Supabase Auth com e-mail e senha** â€” jÃ¡ era a decisÃ£o; mantida. NÃ£o hÃ¡ domÃ­nio corporativo para federar, entÃ£o SSO fica fora de escopo.
- **Cadastro fechado por convite** â€” sem domÃ­nio de e-mail para filtrar, cadastro aberto deixa qualquer pessoa que descubra a URL criar conta num sistema que guarda inventÃ¡rio de infraestrutura.
- **`@supabase/ssr` com cookie `httpOnly`** â€” como front e servidor estÃ£o na mesma origem, o cookie funciona mesmo em `*.vercel.app`, e o token nunca fica legÃ­vel por JavaScript. Ã‰ a vantagem concreta do monolito nesse projeto.
- **Middleware renovando a sessÃ£o** â€” sem ele o token expira no meio da navegaÃ§Ã£o e o usuÃ¡rio Ã© deslogado sem motivo aparente.
- **Middlewares do tRPC em vez de biblioteca de permissÃ£o** â€” as regras sÃ£o "estÃ¡ logado", "pertence ao tenant" e "Ã© administrador"; encadear trÃªs middlewares resolve isso sem introduzir uma camada de definiÃ§Ã£o de polÃ­tica para aprender.
- **AutorizaÃ§Ã£o no servidor, nÃ£o no RLS** â€” o Prisma conecta com um role dono das tabelas, que **bypassa RLS por padrÃ£o**. Fazer as policies valerem exigiria abrir transaÃ§Ã£o com `SET LOCAL role` e `SET LOCAL request.jwt.claims` a cada request, com custo de transaÃ§Ã£o por chamada e atrito com o pooler.
- **RLS ligado mesmo assim** â€” se uma credencial vazar ou um procedimento esquecer o middleware, a policy Ã© a Ãºltima barreira entre tenants. Deny by default garante que tabela nova nasce fechada.

---

## 8. Testes

| Item | Escolha |
|---|---|
| Runner | Vitest, Ãºnico para servidor e componentes |
| Componentes | Testing Library |
| IntegraÃ§Ã£o de banco | Testcontainers com Postgres real |
| Teste de procedimento | `createCaller` do tRPC, chamando o router direto |
| E2E de interface | Playwright |
| Teste obrigatÃ³rio de isolamento | Um caso por procedimento: tenant A nÃ£o enxerga dado de tenant B |
| Meta de cobertura | Sem percentual; caminhos crÃ­ticos obrigatÃ³rios |

- **Vitest Ãºnico** â€” jÃ¡ era a decisÃ£o; mantida. Com um projeto sÃ³, um runner sÃ³ cobre servidor e tela, com a mesma config do build.
- **Testcontainers com Postgres real** â€” mockar o Prisma testa o mock, nÃ£o o banco. Constraint, cascade, transaÃ§Ã£o e policy de RLS sÃ³ falham contra Postgres de verdade.
- **`createCaller`** â€” testa o procedimento com contexto montado Ã  mÃ£o, incluindo middleware de sessÃ£o e tenant, sem subir servidor HTTP.
- **Playwright** â€” os fluxos que travam a operaÃ§Ã£o (login, abertura de chamado, cadastro de ativo) precisam ser testados no navegador.
- **Teste de isolamento por procedimento** â€” vazamento entre tenants Ã© a falha mais cara desse sistema e a mais fÃ¡cil de introduzir sem perceber; precisa ser verificada por teste, nÃ£o por revisÃ£o.
- **Sem meta de percentual** â€” meta de cobertura produz teste escrito para subir nÃºmero; caminho crÃ­tico Ã© critÃ©rio verificÃ¡vel.

---

## 9. Hospedagem e operaÃ§Ã£o

| Item | Escolha |
|---|---|
| Hospedagem | Vercel, um projeto |
| Plano | Hobby |
| RegiÃ£o das functions | PadrÃ£o do Hobby (Estados Unidos) |
| RegiÃ£o do Supabase | `sa-east-1` (SÃ£o Paulo) |
| Limite de execuÃ§Ã£o | 60s por request |
| Fila e agendamento | Fora de escopo; tudo roda dentro do request |
| ConfiguraÃ§Ã£o | VariÃ¡veis de ambiente validadas com Zod no boot |
| Log | Log estruturado em JSON, com `request_id` e `tenant_id` |
| Rastreamento de erro | Sentry |
| CI | GitHub Actions |
| Migration em deploy | `prisma migrate deploy` em job do GitHub Actions, antes do deploy |

- **Vercel com um projeto** â€” o Next Ã© o caso nativo da plataforma, entÃ£o build, preview e roteamento funcionam sem adapter nem configuraÃ§Ã£o extra.
- **Plano Hobby** â€” o Hobby cobre uso pessoal nÃ£o-comercial, que Ã© o caso: projeto de disciplina, sem cobranÃ§a e sem ninguÃ©m sendo pago para escrever o cÃ³digo. Se o sistema sair do contexto acadÃªmico, o plano precisa mudar antes.
- **RegiÃ£o padrÃ£o** â€” SÃ£o Paulo Ã© oferecida apenas no Pro; no Hobby as functions rodam nos EUA e cada query paga ida e volta transatlÃ¢ntica. Em contexto de demonstraÃ§Ã£o Ã© aceitÃ¡vel, mas Ã© o primeiro item a mudar se o projeto for usado de verdade.
- **Supabase no plano gratuito** â€” projeto ocioso pode ser pausado depois de alguns dias sem uso; em semestre com intervalo entre entregas, vale confirmar o comportamento atual antes de uma apresentaÃ§Ã£o.
- **Limite de 60s** â€” vira o teto de qualquer operaÃ§Ã£o: importaÃ§Ã£o de planilha de ativos e relatÃ³rio grande precisam ser desenhados em lotes que caibam nesse tempo.
- **Sem fila e sem agendamento** â€” nÃ£o hÃ¡ volume assÃ­ncrono conhecido; a consequÃªncia Ã© que envio de e-mail e integraÃ§Ã£o externa rodam dentro do request e seguram a resposta.
- **Env validado com Zod** â€” falhar na subida Ã© melhor que `undefined` virando comportamento silencioso em produÃ§Ã£o. Vale separar as variÃ¡veis de servidor das expostas ao cliente, porque `NEXT_PUBLIC_` vai para o bundle.
- **Log com `tenant_id`** â€” investigar incidente em sistema multi-tenant sem poder filtrar por tenant Ã© procurar no escuro.
- **Migration no CI, nÃ£o no boot** â€” em serverless vÃ¡rias instÃ¢ncias sobem em paralelo e tentariam migrar ao mesmo tempo.

---

## 10. SeguranÃ§a

| Item | Escolha |
|---|---|
| CabeÃ§alhos HTTP | Configurados em `next.config.js` |
| CSP | Restritiva, sem `unsafe-inline` |
| Rate limit | Por IP e por usuÃ¡rio, com contador no Postgres |
| Segredos | Environment variables da Vercel; nada com prefixo `NEXT_PUBLIC_` |
| `service_role` key do Supabase | Somente em cÃ³digo de servidor |
| Auditoria | Tabela append-only com ator, tenant, aÃ§Ã£o e recurso |

- **CabeÃ§alhos no `next.config.js`** â€” cabeÃ§alho de seguranÃ§a ausente Ã© achado previsÃ­vel e barato de evitar; no Next nÃ£o Ã© preciso middleware para isso.
- **CSP restritiva** â€” o cookie Ã© `httpOnly`, mas um XSS ainda faz request autenticado em nome do usuÃ¡rio; a CSP Ã© o que impede.
- **Rate limit em Postgres** â€” contador em memÃ³ria nÃ£o funciona em serverless, porque cada instÃ¢ncia tem o seu e o limite nunca Ã© atingido.
- **`service_role` sÃ³ no servidor** â€” essa chave ignora RLS; num arquivo que o bundle do cliente alcanÃ§a, ela dÃ¡ acesso total ao banco para qualquer visitante. A fronteira entre servidor e cliente no Next Ã© fÃ¡cil de cruzar por engano com um import.
- **Auditoria desde o inÃ­cio** â€” sistema de TI precisa responder quem mudou o quÃª; retrofitar log de auditoria depois nÃ£o recupera o passado.

---

## 11. Qualidade de cÃ³digo

| Item | Escolha |
|---|---|
| Lint e formataÃ§Ã£o | ESLint + Prettier |
| Hook de prÃ©-commit | lint-staged + husky, apenas lint e formataÃ§Ã£o |
| ConvenÃ§Ã£o de commit | Nenhuma automaÃ§Ã£o; mensagem escrita pela pessoa |

- **ESLint + Prettier** â€” com repositÃ³rio Ãºnico, uma config sÃ³ vale para tudo.
- **PrÃ©-commit sÃ³ de lint** â€” barra o erro trivial antes do CI sem interferir na mensagem de commit.
- **Sem commitlint** â€” a mensagem Ã© responsabilidade de quem commita; validaÃ§Ã£o automÃ¡tica de formato seria cerimÃ´nia sem changelog gerado para justificar.

---

## Alternativas descartadas (material para a seÃ§Ã£o do ADR)

| Alternativa | Motivo do descarte |
|---|---|
| Front e API em projetos separados | Criaria fronteira HTTP, CORS e dois deploys sem equipe separada para justificar |
| REST com OpenAPI gerado | Passo de geraÃ§Ã£o e cliente versionado que o tRPC dispensa dentro de um projeto sÃ³ |
| GraphQL | Custo de schema, resolver e cache nÃ£o se paga no volume de telas atual |
| Server Actions para mutaÃ§Ã£o | Segundo caminho de mutaÃ§Ã£o, com outra validaÃ§Ã£o e outra checagem de permissÃ£o |
| Server Components buscando dado direto no Prisma | Segundo caminho de leitura, com a checagem de tenant duplicada em outro lugar |
| RLS como autorizaÃ§Ã£o primÃ¡ria | O Prisma bypassa RLS por padrÃ£o; fazer valer exigiria transaÃ§Ã£o com `SET LOCAL` a cada request |
| Acesso a dado pelo cliente do Supabase em vez do Prisma | Deixaria RLS como autorizaÃ§Ã£o, mas espalharia o acesso a dado em dois caminhos e tiraria o tipo do Prisma de dentro do tRPC |
| Cadastro aberto por e-mail | Sem domÃ­nio corporativo para filtrar, qualquer pessoa com a URL criaria conta |
| SSO corporativo (OIDC/SAML) | NÃ£o hÃ¡ e-mail corporativo para federar |
| SessÃ£o em `localStorage` pelo `supabase-js` | LegÃ­vel por XSS, e desnecessÃ¡rio: mesma origem permite cookie `httpOnly` |
| Supabase CLI como dono das migrations | Dois donos de schema no mesmo banco se sobrescrevem |
| CASL ou biblioteca de polÃ­tica | As regras cabem em trÃªs middlewares de tRPC; a camada extra seria conceito a mais para aprender |
| Zustand ou Redux | O estado de cliente que sobra depois do TanStack Query Ã© pequeno demais |
| Biblioteca de componentes fechada (MUI, Mantine) | O design vem do Figma e precisaria ser imposto por cima do visual da biblioteca |
| Fila (BullMQ, pg-boss) | Sem volume assÃ­ncrono conhecido, e worker de vida longa nÃ£o roda na Vercel |
| Schema ou banco por tenant | Multiplicaria cada migration pelo nÃºmero de tenants sem exigÃªncia que justifique |
| Prisma mockado nos testes | Testa o mock; constraint, transaÃ§Ã£o e policy nÃ£o sÃ£o exercitadas |

---

## ConsequÃªncias (material para a seÃ§Ã£o do ADR)

**Fica mais fÃ¡cil**
- Mudar o retorno de um procedimento quebra o build da tela que o consome, na hora, sem passo de geraÃ§Ã£o.
- SessÃ£o segura sem esforÃ§o: mesma origem permite cookie `httpOnly` sem domÃ­nio prÃ³prio e sem CORS.
- Uma feature inteira cabe em um PR, num repositÃ³rio sÃ³.
- Menos infraestrutura para montar: um projeto na Vercel, um CI, um runner de teste.
- Deploy atÃ´mico: tela e servidor sobem juntos, entÃ£o nunca hÃ¡ versÃ£o do cliente falando com servidor de outra versÃ£o.

**Fica mais difÃ­cil**
- Escalar as partes de forma independente: front e servidor sobem sempre juntos.
- Segurar a fronteira servidor/cliente: um import errado leva chave secreta para o bundle, e o compilador nÃ£o avisa em todos os casos.
- Aproveitar Server Components: a decisÃ£o de buscar tudo por tRPC descarta o principal recurso do App Router.
- LatÃªncia: com as functions nos EUA e o banco em SÃ£o Paulo, cada query paga a travessia.
- Cold start: a primeira invocaÃ§Ã£o depois de ociosidade paga a inicializaÃ§Ã£o.
- Qualquer operaÃ§Ã£o precisa caber em 60s, o que obriga a desenhar importaÃ§Ã£o e relatÃ³rio em lotes.
- Envio de e-mail e integraÃ§Ã£o externa seguram a resposta do request.
- Manter middlewares e RLS coerentes exige disciplina â€” policy desatualizada dÃ¡ falsa sensaÃ§Ã£o de proteÃ§Ã£o.

**O que isso impede de fazer depois sem custo**
- Atender consumidor nÃ£o-TypeScript (app mobile nativo, integraÃ§Ã£o de terceiro, webhook tipado): tRPC nÃ£o serve e seria preciso expor REST ao lado.
- Qualquer funcionalidade com conexÃ£o aberta (notificaÃ§Ã£o em tempo real, streaming de log): a Vercel nÃ£o suporta WebSocket.
- Processamento longo (importaÃ§Ã£o grande, varredura de rede): estoura o limite de execuÃ§Ã£o.
- Trabalho agendado ou assÃ­ncrono: exige fila e um lugar para o worker rodar, que nÃ£o Ã© a Vercel.
- Separar o servidor do front depois: o acoplamento de tipo entre tela e router Ã© justamente o que torna a separaÃ§Ã£o trabalhosa.
- Trocar Prisma por outro ORM: as migrations e o SQL de RLS estÃ£o dentro do Prisma Migrate.
- Sair do Supabase: Auth, banco e polÃ­ticas estÃ£o acoplados ao projeto.
- Adicionar `tenant_id` a uma tabela criada sem ele: exige backfill e revisÃ£o de toda query que a toca.
- Federar com identidade corporativa depois: exige migrar os usuÃ¡rios jÃ¡ cadastrados por e-mail e senha.

**DependÃªncia do contexto acadÃªmico**
- O plano Hobby sÃ³ vale enquanto o projeto for didÃ¡tico. Se a empresa passar a usar o sistema, Ã© preciso migrar para Pro antes.

---

## O que este ADR nÃ£o decide

- Modelagem de domÃ­nio, entidades e relacionamentos.
- Design system, tokens e identidade visual.
- PapÃ©is e matriz de permissÃ£o dentro de cada tenant.
- Provisionamento de tenant: quem cria, como se convida usuÃ¡rio.
- Provedor de e-mail transacional e demais integraÃ§Ãµes.
- EstratÃ©gia de backup, retenÃ§Ã£o e plano de recuperaÃ§Ã£o.
- Ambientes (quantos, como sÃ£o promovidos) e polÃ­tica de branch.
- Feature flags.
- Observabilidade alÃ©m de log e erro (mÃ©trica, tracing distribuÃ­do).
- LGPD: base legal, polÃ­tica de retenÃ§Ã£o e fluxo de exclusÃ£o de dados.
- SLO, meta de latÃªncia e orÃ§amento de custo.