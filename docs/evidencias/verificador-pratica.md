# Pareceres locais do verificador

Rodadas de 09/11/2026 sobre árvores Git congeladas. O índice principal e os arquivos de trabalho ficaram fora da alteração plantada. Os hashes são de árvores e precisam ser complementados pelos commits da entrega.

## Catálogo com limite defeituoso

Spec: docs/specs/005-catalogo-emprestimos/spec.md. Base: 8dc5782af905fbb56437663b62bc86f487352e50. Árvore: 2f925d58b48a93a2cd048dfeb6f09ad07679531c.

| Critério | Parecer | Evidência |
| --- | --- | --- |
| CA-01 | aprovado | src/server/api/routers/auth.ts: tenantProcedure rejeita sessão ausente com UNAUTHORIZED e fornece membership. catalog usa ctx.membership.tenantId; src/server/catalog.ts: readCatalog filtra tenantId e retorna dados e disponibilidade considerando empréstimos abertos. app/catalogo/page.tsx exibe esses campos. |
| CA-02 | aprovado | src/server/catalog.ts: requestLoan cria loan e auditLog dentro da mesma db.$transaction; dueAt recebe clock.time + 14 * 86_400_000 e borrowedAt recebe clock.time. tests/catalog.test.ts contém asserções do prazo e da auditoria. |
| CA-03 | aprovado | src/server/catalog.ts: requestLoan busca e bloqueia o equipamento pelo tenant autenticado, rejeita ausência com NOT_FOUND e rejeita status diferente de AVAILABLE ou empréstimo aberto com CONFLICT. tests/catalog.test.ts contempla item emprestado, MAINTENANCE, RETIRED e outro tenant. |
| CA-04 | reprovado | src/server/catalog.ts: a consulta de empréstimos usa take: 3, mas o bloqueio verifica loans.length >= 4, condição impossível. Assim, três empréstimos abertos sem atraso não impedem a quarta solicitação. Isso contradiz a asserção TOO_MANY_REQUESTS em tests/catalog.test.ts. |
| CA-05 | reprovado | src/server/catalog.ts: FOR UPDATE no equipamento protege a corrida pelo mesmo item. Porém, para itens diferentes e pessoa com dois empréstimos, o bloqueio do vínculo apenas serializa as solicitações: após a primeira criar o terceiro, a segunda encontra três e passa pela condição loans.length >= 4. Ambas podem ter sucesso, contrariando a asserção de tests/catalog.test.ts. |
| CA-06 | aprovado | src/server/catalog.ts: readMyLoans filtra returnedAt: null, tenantId e borrowerMembershipId do contexto, selecionando item e dueAt. app/catalogo/page.tsx exibe nome, patrimônio e devolução prevista. tests/catalog.test.ts contém asserção de lista vazia para outro vínculo. |
| CA-07 | sem_evidencia | app/catalogo/page.tsx associa data/equipment-photos.json por patrimonio/assetTag, renderiza img e apresenta o link “Fotos: Pixabay”. Contudo, a evidência fornecida não comprova que os objetos JPEG referenciados no Storage estejam disponíveis e correspondam às fotos aprovadas; manifesto e comentário no código não demonstram sua exibição efetiva. |

## Catálogo sem o defeito

Spec: docs/specs/005-catalogo-emprestimos/spec.md. Base: 8dc5782af905fbb56437663b62bc86f487352e50. Árvore: 42f26f904d52b3240e9cbdbaf71f880c863b0013.

| Critério | Parecer | Evidência |
| --- | --- | --- |
| CA-01 | aprovado | src/server/api/routers/auth.ts: tenantProcedure rejeita sessão ausente com UNAUTHORIZED e fornece o tenant da sessão a readCatalog. src/server/catalog.ts: readCatalog filtra por tenantId e calcula BORROWED quando há empréstimo aberto. app/catalogo/page.tsx exibe patrimônio, nome, categoria, retirada e disponibilidade. |
| CA-02 | aprovado | src/server/catalog.ts: requestLoan cria loan e auditLog no mesmo db.$transaction e define dueAt como borrowedAt + 14 * 86_400_000. tests/catalog.test.ts contém asserções do prazo e dos dados da auditoria. |
| CA-03 | aprovado | src/server/catalog.ts: requestLoan busca o item por tenantId e id, rejeita ausência com NOT_FOUND e rejeita status diferente de AVAILABLE ou empréstimo aberto com CONFLICT. tests/catalog.test.ts contempla item emprestado, MAINTENANCE, RETIRED e item de outro tenant. |
| CA-04 | aprovado | src/server/catalog.ts: requestLoan consulta empréstimos abertos do vínculo, rejeita dueAt anterior ao relógio do banco com PRECONDITION_FAILED e quantidade >= 3 com TOO_MANY_REQUESTS. tests/catalog.test.ts contém asserções para quarta solicitação e empréstimo vencido. |
| CA-05 | aprovado | src/server/catalog.ts: requestLoan bloqueia o vínculo e o equipamento com FOR UPDATE dentro da transação ReadCommitted, antes de revalidar disponibilidade e limite. tests/catalog.test.ts usa Promise.allSettled nos dois cenários concorrentes e exige um sucesso e uma rejeição, conferindo as contagens persistidas. |
| CA-06 | aprovado | src/server/catalog.ts: readMyLoans filtra returnedAt: null, tenantId e borrowerMembershipId obtidos do contexto, retornando item e dueAt. app/catalogo/page.tsx apresenta nome, patrimônio e devolução prevista. tests/catalog.test.ts contém asserção de lista vazia para outro vínculo. |
| CA-07 | sem_evidencia | app/catalogo/page.tsx associa photo.patrimonio a item.assetTag, renderiza img e exibe o link “Fotos: Pixabay”; data/equipment-photos.json fornece o manifesto. Porém, a evidência não inclui os arquivos de imagem, confirmação de aprovação ou comprovação de que os objetos referenciados estão disponíveis e aparecem no catálogo. |

## Login após correção

Spec: docs/specs/003-login-real/spec.md. Base: 8dc5782af905fbb56437663b62bc86f487352e50. Árvore: ff3d89af7b315359aea7b38ec00378fd3147d799.

| Critério | Parecer | Evidência |
| --- | --- | --- |
| LOGIN-01 | aprovado | proxy.ts redireciona /catalogo sem claims válidos para /login; app/catalogo/page.tsx exige readMembership; tenantProcedure em src/server/api/routers/auth.ts retorna UNAUTHORIZED sem sessão. |
| LOGIN-02 | aprovado | src/server/api/routers/auth.ts autentica com signInWithPassword e grava cookies somente após encontrar membership. src/server/auth/session.ts configura httpOnly: true. docs/evidencias/pratica-local.md registra login HTTP com cookie HttpOnly. |
| LOGIN-03 | aprovado | Em src/server/api/routers/auth.ts, cookies ficam pendentes e não são gravados na falha. components/login/login-form.tsx apresenta mensagem genérica; components/login/login-form.test.tsx contém verificação dessa mensagem para resposta malsucedida. |
| LOGIN-04 | aprovado | src/server/auth/session.ts exige membership em suporte_ti associada à sessão existente em auth.sessions. scripts/test-logout-local.mjs contém assertions de 401 e ausência de cookies para conta sem vínculo; tenantProcedure bloqueia acesso sem membership. |
| LOGIN-05 | aprovado | src/server/api/routers/auth.ts obtém membership de readSession e passa seu tenantId às consultas; catalog e requestLoan usam schemas strict sem tenant no input. src/server/catalog.ts filtra dados pelo tenant da membership. |
| LOGIN-06 | aprovado | logout em src/server/api/routers/auth.ts chama signOut com scope local. readMembership exige sessão presente em auth.sessions. scripts/test-logout-local.mjs contém replay do mesmo cookie após logout com assertions de 401; docs/evidencias/pratica-local.md registra essa regressão. |
| LOGIN-07 | aprovado | hasActivePasswordSession em src/server/auth/session.ts calcula oito horas pelo timestamp do método password, ignorando token_refresh. tests/login-attempts.test.ts verifica aceitação antes do teto e rejeição no teto; docs/evidencias/pratica-local.md relata preservação desse horário em renovação real. |
| LOGIN-08 | aprovado | src/server/auth/login-attempts.ts bloqueia ambas as dimensões com advisory locks no PostgreSQL antes de contar e reservar, aplicando limites 5/20 e janela de 15 minutos. A reserva antecede a autenticação, abrangendo contas inexistentes. tests/login-attempts.test.ts contém verificações de concorrência por conta, teto por IP e nova tentativa após expiração. |

## Dados iniciais

Spec: docs/specs/004-dados-iniciais/spec.md. Base: 8dc5782af905fbb56437663b62bc86f487352e50. Árvore: ff3d89af7b315359aea7b38ec00378fd3147d799.

| Critério | Parecer | Evidência |
| --- | --- | --- |
| CA-01 | aprovado | prisma/seed.ts define 12 patrimônios únicos, TI-0001 a TI-0012, com nomes, categorias e retirada em 'Balcão de Suporte TI', no tenant suporte_ti. tests/seed.test.ts contém verificações dos patrimônios, categorias e local. |
| CA-02 | aprovado | prisma/seed.ts atribui MAINTENANCE a TI-0004, TI-0007 e TI-0010 e AVAILABLE aos nove restantes; não contém criação de empréstimos. tests/seed.test.ts verifica os três patrimônios em manutenção e contagem inicial de empréstimos igual a zero. |
| CA-03 | sem_evidencia | prisma/seed.ts cria vínculo COLLABORATOR para o UUID informado e conta os empréstimos docentes, sem incluir credenciais. Porém, docs/evidencias/pratica-local.md informa que a conta docente do deploy depende do operador; falta comprovação do provisionamento da conta especificada e da entrega externa da credencial. |
| CA-04 | aprovado | prisma/seed.ts usa upsert com update vazio para tenant, vínculo e equipamentos, preservando registros existentes, e não altera empréstimos. tests/seed.test.ts contém segunda chamada ao seed e verificações de 12 equipamentos, quatro categorias, dois vínculos, estado RETIRED e empréstimo aberto preservados. |
| CA-05 | sem_evidencia | data/equipment-photos.json relaciona 12 patrimônios a objetos, IDs e hashes distintos, com origem, autoria, licença e dimensões declaradas de 800×600; app/catalogo/page.tsx resolve os caminhos pelo manifesto. Contudo, os JPEGs e a validação de suas dimensões e hashes não foram fornecidos. docs/evidencias/pratica-local.md relata aprovação local, mas registra upload e validação das URLs públicas pendentes. |

## Catálogo e empréstimos

Spec: docs/specs/005-catalogo-emprestimos/spec.md. Base: 8dc5782af905fbb56437663b62bc86f487352e50. Árvore: ff3d89af7b315359aea7b38ec00378fd3147d799.

| Critério | Parecer | Evidência |
| --- | --- | --- |
| CA-01 | aprovado | src/server/api/routers/auth.ts: tenantProcedure rejeita sessão ausente com UNAUTHORIZED e passa tenantId do vínculo a readCatalog. src/server/catalog.ts: readCatalog filtra por tenantId e calcula BORROWED quando existe empréstimo aberto. app/catalogo/page.tsx exibe os dados e a disponibilidade. tests/catalog.test.ts contém asserções de isolamento e estados. |
| CA-02 | aprovado | src/server/catalog.ts: requestLoan cria loan e auditLog dentro da mesma db.$transaction e define dueAt como borrowedAt + 14 * 86_400_000. tests/catalog.test.ts verifica a diferença de datas e os dados da auditoria. |
| CA-03 | aprovado | src/server/catalog.ts: requestLoan busca equipamento pelo tenant autenticado, retorna NOT_FOUND para item externo e CONFLICT para estado diferente de AVAILABLE ou empréstimo aberto existente. tests/catalog.test.ts contém asserções para item emprestado, MAINTENANCE, RETIRED e outro tenant. |
| CA-04 | aprovado | src/server/catalog.ts: requestLoan consulta empréstimos abertos do vínculo, rejeita dueAt anterior ao relógio do banco com PRECONDITION_FAILED e quantidade >= 3 com TOO_MANY_REQUESTS. tests/catalog.test.ts contém asserções para quarta solicitação e empréstimo vencido. |
| CA-05 | aprovado | src/server/catalog.ts: requestLoan bloqueia a linha do vínculo e a do equipamento com FOR UPDATE dentro da transação ReadCommitted antes de revalidar as regras. tests/catalog.test.ts usa Promise.allSettled nas duas corridas e exige um sucesso, uma rejeição e contagens finais de um e três empréstimos, respectivamente. |
| CA-06 | aprovado | src/server/catalog.ts: readMyLoans filtra returnedAt: null, tenantId e borrowerMembershipId do contexto e seleciona item e dueAt. app/catalogo/page.tsx apresenta nome, patrimônio e devolução prevista. tests/catalog.test.ts verifica o empréstimo próprio e lista vazia para outro vínculo. |
| CA-07 | sem_evidencia | app/catalogo/page.tsx associa photoByTag.get(item.assetTag) ao manifesto data/equipment-photos.json e renderiza o link visível “Fotos: Pixabay”. Porém, docs/evidencias/pratica-local.md, linha da Spec 005 CA-07, informa que as 12 URLs públicas aguardam upload e validação; a exibição efetiva das fotos não está comprovada. |

## Dados iniciais com evidência do Storage local

Spec: docs/specs/004-dados-iniciais/spec.md. Base: 8dc5782af905fbb56437663b62bc86f487352e50. Árvore: 80c65ebe04b1b1bdd826caf00bcf498bbc434387.

| Critério | Parecer | Evidência |
| --- | --- | --- |
| CA-01 | aprovado | prisma/seed.ts define 12 patrimônios TI-0001 a TI-0012, nomes, categorias e retirada no Balcão de Suporte TI para suporte_ti. tests/seed.test.ts contém verificações dos patrimônios, categorias e local; docs/evidencias/pratica-local.md registra validação local. |
| CA-02 | aprovado | prisma/seed.ts cria TI-0004, TI-0007 e TI-0010 como MAINTENANCE e os nove restantes como AVAILABLE, sem inserir empréstimos. tests/seed.test.ts verifica os três patrimônios em manutenção e contagem inicial de empréstimos igual a zero. |
| CA-03 | sem_evidencia | prisma/seed.ts cria vínculo COLLABORATOR para o UUID informado e conta seus empréstimos; tests/seed.test.ts cobre uma conta descartável. docs/evidencias/pratica-local.md informa que a conta docente do deploy depende do operador. Não há comprovação do provisionamento da conta especificada nem da entrega externa da credencial. |
| CA-04 | aprovado | prisma/seed.ts usa upserts com update vazio, preservando vínculos e estados existentes, e não altera empréstimos. tests/seed.test.ts contém segunda chamada ao seed e verificações de 12 equipamentos, quatro categorias, dois vínculos, estado RETIRED e empréstimo aberto preservados; docs/evidencias/pratica-local.md relata essa validação local. |
| CA-05 | aprovado | data/equipment-photos.json associa os 12 patrimônios a objetos, IDs e hashes distintos, dimensões 800×600, origem, autor e licença. app/catalogo/page.tsx resolve a foto pelo patrimônio. docs/evidencias/pratica-local.md registra revisão dos JPEGs e conferência dos hashes no Storage local. A evidência sustenta o ambiente local; o upload no deploy permanece pendente. |

## Catálogo com evidência do Storage local

Spec: docs/specs/005-catalogo-emprestimos/spec.md. Base: 8dc5782af905fbb56437663b62bc86f487352e50. Árvore: 80c65ebe04b1b1bdd826caf00bcf498bbc434387.

| Critério | Parecer | Evidência |
| --- | --- | --- |
| CA-01 | aprovado | src/server/api/routers/auth.ts: tenantProcedure exige sessão e catalog usa ctx.membership.tenantId. src/server/catalog.ts: readCatalog filtra tenant e calcula disponibilidade considerando empréstimo aberto. app/catalogo/page.tsx exibe os dados e redireciona sem vínculo. docs/evidencias/pratica-local.md relata bloqueio anônimo no fluxo HTTP. |
| CA-02 | aprovado | src/server/catalog.ts: requestLoan cria loan e auditLog dentro da mesma db.$transaction; borrowedAt recebe clock.time e dueAt soma 14 * 86_400_000. tests/catalog.test.ts contém asserções do prazo e da auditoria. |
| CA-03 | aprovado | src/server/catalog.ts: requestLoan busca equipamento pelo tenant autenticado, rejeita ausência com NOT_FOUND e estado diferente de AVAILABLE ou empréstimo aberto com CONFLICT. tests/catalog.test.ts contempla item emprestado, MAINTENANCE, RETIRED e outro tenant. |
| CA-04 | aprovado | src/server/catalog.ts: requestLoan consulta empréstimos abertos do vínculo e rejeita vencimento anterior ao relógio do banco com PRECONDITION_FAILED ou três empréstimos com TOO_MANY_REQUESTS. tests/catalog.test.ts contém casos de quarta solicitação e empréstimo vencido. |
| CA-05 | aprovado | src/server/catalog.ts: requestLoan bloqueia o vínculo e o equipamento com FOR UPDATE antes de revalidar disponibilidade e limite, em transação ReadCommitted. tests/catalog.test.ts contém duas corridas com Promise.allSettled e exige um sucesso e uma rejeição em cada cenário; docs/evidencias/pratica-local.md relata cobertura PostgreSQL das duas corridas. |
| CA-06 | aprovado | src/server/catalog.ts: readMyLoans filtra returnedAt: null, tenantId e borrowerMembershipId do contexto, selecionando item e dueAt. app/catalogo/page.tsx apresenta nome, patrimônio e devolução prevista. tests/catalog.test.ts verifica lista do solicitante e lista vazia de outro vínculo. |
| CA-07 | aprovado | app/catalogo/page.tsx associa photos.patrimonio a item.assetTag, renderiza o objeto do manifesto e o link visível “Fotos: Pixabay”. data/equipment-photos.json fornece os 12 mapeamentos e hashes. docs/evidencias/pratica-local.md relata HTML correspondente e 12 objetos locais com HTTP 200, MIME JPEG e hashes aprovados. A evidência sustenta o ambiente local; upload e validação do Storage do deploy permanecem pendentes. |

## Rodadas sobre commits

O commit de reversão f7f6f24da51b4d32b2e4c8129147d60f088ef7da restaurou a mesma árvore de e0ad8f0. As rodadas abaixo conferem a revisão de código. A conta docente e o Storage do deploy continuam pendentes.

### Prova com erro plantado no commit

Spec: docs/specs/005-catalogo-emprestimos/spec.md. Base: 8dc5782af905fbb56437663b62bc86f487352e50. Commit: 0d447f9d9700b10b16579a3601959b7580cda5d5.

| Critério | Parecer | Evidência |
| --- | --- | --- |
| CA-01 | aprovado | src/server/api/routers/auth.ts exige sessão em tenantProcedure e deriva tenantId do vínculo autenticado. src/server/catalog.ts, readCatalog, filtra por tenantId e calcula disponibilidade considerando empréstimos abertos. app/catalogo/page.tsx apresenta patrimônio, nome, categoria, retirada e estado. tests/catalog.test.ts contém asserções de isolamento. |
| CA-02 | aprovado | src/server/catalog.ts, requestLoan, cria loan e auditLog dentro da mesma db.$transaction e define dueAt como borrowedAt + 14 * 86_400_000. tests/catalog.test.ts contém asserções do prazo e da auditoria. |
| CA-03 | aprovado | src/server/catalog.ts, requestLoan, busca equipamento pelo tenant autenticado, exige status AVAILABLE e rejeita empréstimo aberto existente. tests/catalog.test.ts contém expectativas CONFLICT para emprestado, manutenção e retirado, e NOT_FOUND para outro tenant. |
| CA-04 | reprovado | src/server/catalog.ts consulta empréstimos com take: 3, mas bloqueia somente quando loans.length >= 4, condição inalcançável. A quarta solicitação pode ser aceita. O recorte de três registros também pode omitir um vencido quando houver mais empréstimos. As expectativas de limite em tests/catalog.test.ts contradizem essa implementação. |
| CA-05 | reprovado | src/server/catalog.ts serializa solicitações com FOR UPDATE no vínculo e no equipamento, sustentando exclusividade para o mesmo item. Porém, com dois empréstimos, duas solicitações para itens diferentes podem ambas passar porque take: 3 combinado com loans.length >= 4 nunca bloqueia. Isso contraria a expectativa de um único sucesso em tests/catalog.test.ts, variável cap. |
| CA-06 | aprovado | src/server/catalog.ts, readMyLoans, filtra returnedAt: null, tenantId e borrowerMembershipId do contexto e seleciona item e dueAt. app/catalogo/page.tsx mostra nome, patrimônio e devolução prevista. tests/catalog.test.ts verifica lista vazia para outro vínculo. |
| CA-07 | sem_evidencia | app/catalogo/page.tsx associa photoByTag ao assetTag e exibe o link “Fotos: Pixabay”, usando data/equipment-photos.json. docs/evidencias/pratica-local.md relata validação dos objetos locais, mas declara upload e validação das URLs do deploy pendentes. A exibição das fotos no deploy permanece sem comprovação. |

### Login após reversão

Spec: docs/specs/003-login-real/spec.md. Base: 8dc5782af905fbb56437663b62bc86f487352e50. Commit: f7f6f24da51b4d32b2e4c8129147d60f088ef7da.

| Critério | Parecer | Evidência |
| --- | --- | --- |
| LOGIN-01 | aprovado | app/catalogo/page.tsx redireciona para /login quando readMembership não retorna vínculo. Em src/server/api/routers/auth.ts, tenantProcedure rejeita sessão ausente com UNAUTHORIZED. |
| LOGIN-02 | aprovado | src/server/api/routers/auth.ts, procedimento login, usa signInWithPassword e grava os cookies somente após encontrar membership. src/server/auth/session.ts configura httpOnly: true. docs/evidencias/pratica-local.md registra recebimento de cookie HttpOnly por conta com vínculo. |
| LOGIN-03 | aprovado | src/server/api/routers/auth.ts mantém cookies pendentes e não os grava quando a autenticação falha. components/login/login-form.tsx apresenta mensagem genérica; components/login/login-form.test.tsx contém a verificação dessa mensagem no teste LOGIN-03. |
| LOGIN-04 | aprovado | src/server/auth/session.ts, readMembership, exige vínculo em suporte_ti associado à sessão. scripts/test-logout-local.mjs verifica resposta 401 e ausência de Set-Cookie antes de criar a membership. |
| LOGIN-05 | aprovado | src/server/api/routers/auth.ts resolve membership por ctx.readSession; catalog e requestLoan usam schemas strict e passam o tenant da membership às operações. src/server/auth/session.ts resolve o vínculo pela sessão e pelo tenant suporte_ti, sem tenant recebido do cliente. |
| LOGIN-06 | aprovado | src/server/api/routers/auth.ts chama signOut com scope local. readMembership, em src/server/auth/session.ts, exige registro em auth.sessions. scripts/test-logout-local.mjs verifica acesso 200 antes do logout e 401 ao reapresentar o mesmo cookie depois; docs/evidencias/pratica-local.md registra essa regressão. |
| LOGIN-07 | aprovado | src/server/auth/session.ts, hasActivePasswordSession, calcula o teto de oito horas pelo timestamp do método password, sem usar token_refresh. tests/login-attempts.test.ts verifica aceitação antes do teto e rejeição no limite com refresh posterior. docs/evidencias/pratica-local.md registra preservação desse horário em renovação real. |
| LOGIN-08 | aprovado | src/server/auth/login-attempts.ts reserva tentativas no PostgreSQL sob locks das duas dimensões, aplicando limites de cinco por conta e vinte por IP em 15 minutos. O procedimento login reserva antes de consultar o Auth, incluindo contas inexistentes. tests/login-attempts.test.ts contém verificações de concorrência, teto por IP e expiração; docs/evidencias/pratica-local.md registra os resultados locais. |

### Dados iniciais após reversão

Spec: docs/specs/004-dados-iniciais/spec.md. Base: 8dc5782af905fbb56437663b62bc86f487352e50. Commit: f7f6f24da51b4d32b2e4c8129147d60f088ef7da.

| Critério | Parecer | Evidência |
| --- | --- | --- |
| CA-01 | aprovado | prisma/seed.ts define os 12 patrimônios TI-0001 a TI-0012, seus nomes e categorias, tenant suporte_ti e retirada no Balcão de Suporte TI. tests/seed.test.ts contém verificações dos patrimônios, categorias e local. |
| CA-02 | aprovado | prisma/seed.ts cria TI-0004, TI-0007 e TI-0010 como MAINTENANCE e os outros nove como AVAILABLE, sem inserir empréstimos. tests/seed.test.ts verifica os três itens em manutenção e a contagem inicial de zero empréstimos. |
| CA-03 | sem_evidencia | prisma/seed.ts cria vínculo COLLABORATOR para o UUID informado e conta os empréstimos docentes. tests/seed.test.ts cobre uma conta descartável. docs/evidencias/pratica-local.md informa que a conta docente do deploy depende do operador. Falta comprovação do vínculo e dos zero empréstimos da conta especificada, além da entrega externa da credencial. |
| CA-04 | aprovado | prisma/seed.ts usa upserts com update vazio e transação com advisory lock, preservando vínculos e estados existentes. tests/seed.test.ts contém duas chamadas ao seed e verificações de 12 equipamentos, quatro categorias, dois vínculos, estado RETIRED e empréstimo aberto preservados. |
| CA-05 | aprovado | data/equipment-photos.json associa os 12 patrimônios a objetos, IDs e hashes distintos, com dimensões 800×600, origem, autoria e licença. app/catalogo/page.tsx resolve a foto pelo patrimônio e objeto do manifesto. docs/evidencias/pratica-local.md registra revisão dos 12 JPEGs e conferência dos hashes no Storage local. A comprovação fornecida é local, com upload no deploy pendente. |

### Catálogo após reversão

Spec: docs/specs/005-catalogo-emprestimos/spec.md. Base: 8dc5782af905fbb56437663b62bc86f487352e50. Commit: f7f6f24da51b4d32b2e4c8129147d60f088ef7da.

| Critério | Parecer | Evidência |
| --- | --- | --- |
| CA-01 | aprovado | src/server/api/routers/auth.ts exige sessão em tenantProcedure e fornece membership.tenantId ao catálogo. src/server/catalog.ts, readCatalog, filtra tenantId e calcula disponibilidade considerando empréstimos abertos. app/catalogo/page.tsx exibe os campos exigidos e redireciona sem vínculo. tests/catalog.test.ts contém asserções de isolamento. |
| CA-02 | aprovado | src/server/catalog.ts, requestLoan, cria loan e auditLog dentro da mesma db.$transaction e define dueAt como borrowedAt + 14 * 86_400_000. tests/catalog.test.ts verifica o intervalo e os dados da auditoria. |
| CA-03 | aprovado | src/server/catalog.ts, requestLoan, busca o equipamento pelo tenant autenticado, exige status AVAILABLE e rejeita empréstimo aberto existente. tests/catalog.test.ts contém expectativas CONFLICT para item emprestado, MAINTENANCE e RETIRED, e NOT_FOUND para outro tenant. |
| CA-04 | aprovado | src/server/catalog.ts, requestLoan, consulta empréstimos abertos do vínculo e rejeita dueAt anterior ao relógio do banco ou quantidade >= 3. tests/catalog.test.ts contém expectativas TOO_MANY_REQUESTS para a quarta solicitação e PRECONDITION_FAILED para atraso. |
| CA-05 | aprovado | src/server/catalog.ts, requestLoan, bloqueia as linhas do vínculo e do equipamento com FOR UPDATE antes das verificações, mantendo os bloqueios na transação ReadCommitted. tests/catalog.test.ts contém as duas corridas com Promise.allSettled e exige um sucesso e uma rejeição em cada cenário. |
| CA-06 | aprovado | src/server/catalog.ts, readMyLoans, filtra returnedAt null, tenantId e borrowerMembershipId do contexto. app/catalogo/page.tsx renderiza nome, patrimônio e dueAt. tests/catalog.test.ts verifica o empréstimo do titular e lista vazia para outro vínculo. |
| CA-07 | sem_evidencia | app/catalogo/page.tsx associa data/equipment-photos.json por patrimônio e renderiza o crédito com link ao Pixabay. docs/evidencias/pratica-local.md relata validação dos objetos locais, mas registra upload e validação das URLs do deploy pendentes. Falta evidência de que as fotos aprovadas sejam servidas no deploy. |
