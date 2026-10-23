# ADR-001 — Stack do projeto

**Status:** aceito  
**Contexto do produto:** [`docs/prd.md`](../prd.md)

## Contexto

Este projeto é um sistema web interno para empréstimo de equipamentos. A
primeira versão precisa oferecer autenticação, catálogo, solicitação e devolução
de itens e uma visão operacional dos empréstimos em aberto.

O time é pequeno, o prazo é curto e não existe código anterior. A solução deve
ser simples de desenvolver e operar, preservar o isolamento dos dados e evitar
que front-end e back-end mantenham contratos duplicados. PostgreSQL, tRPC,
Prisma, Supabase Auth e Vitest já haviam sido escolhidos.

O critério principal desta decisão é adotar o menor número de peças móveis que
atenda ao PRD e que a equipe consiga operar sem aprender uma ferramenta nova no
meio do projeto.

## Decisão

### Arquitetura e aplicação

| Item | Escolha | Justificativa |
|---|---|---|
| Arquitetura | Monolito TypeScript | Não há equipes ou requisitos de escala independentes que justifiquem separar front-end e servidor. |
| Aplicação | Next.js com App Router | Mantém interface e servidor no mesmo projeto e na mesma origem. |
| Repositório | Único | Permite compartilhar tipos entre procedimentos e telas sem geração de código. |
| Linguagem | TypeScript em modo `strict` | Faz os contratos inferidos pelo tRPC cobrirem também os casos nulos. |
| Front-end | React com Client Components como padrão nas telas com dados | Mantém um único caminho de acesso a dados e de verificação de permissões. |
| Camada de servidor | Route Handlers do Next.js | Evita um servidor separado e integra o endpoint tRPC ao App Router. |
| Deploy | Um projeto na Vercel | Mantém front-end e servidor em um deploy atômico. |

O monolito é uma decisão sobre o código e o deploy, não sobre um processo único:
na Vercel, cada rota pode ser executada como uma function separada.

### Interface e estado

| Item | Escolha | Justificativa |
|---|---|---|
| Estado de servidor | TanStack Query por `@trpc/react-query` | Fornece cache, revalidação e estados assíncronos tipados a partir dos procedimentos. |
| Estado de cliente | `useState` e Context | Depois do estado de servidor, filtros, modais e fluxos locais não justificam uma store adicional. |
| Formulários | React Hook Form com `zodResolver` | Reutiliza no formulário os schemas Zod empregados na entrada dos procedimentos. |
| Estilização | Tailwind CSS | Permite reproduzir o design do Figma sem disputar estilos com uma biblioteca opinativa. |
| Componentes | shadcn/ui | Mantém os componentes no repositório e facilita sua customização. |

### API e regras de negócio

| Item | Escolha | Justificativa |
|---|---|---|
| Estilo de API | tRPC | Entrega ao cliente os tipos do servidor sem contrato manual ou etapa de geração. |
| Endpoint | `app/api/trpc/[trpc]/route.ts` | Usa o mecanismo nativo de Route Handlers do Next.js. |
| Organização | `src/server/api/routers/<dominio>.ts` | Mantém cada domínio coeso em vez de espalhar uma funcionalidade por pastas técnicas. |
| Camadas | Router → Service → Prisma | Separa entrada, contexto e permissão das regras de negócio testáveis. |
| Validação | Zod no `.input()` de todo procedimento | Valida dados desconhecidos na fronteira e produz os tipos de entrada. |
| Serialização | superjson | Preserva tipos como `Date` entre servidor e cliente. |
| Contexto da requisição | Sessão, `tenant_id`, `role` e Prisma no `createContext` | Centraliza dados de segurança que não podem ser esquecidos por cada procedimento. |
| Server Actions | Não utilizadas | Evita um segundo caminho de mutação, validação e autorização. |

### Contrato e tipos

| Item | Escolha | Justificativa |
|---|---|---|
| Fonte da verdade | `AppRouter` do tRPC | Uma mudança de retorno incompatível quebra o build do consumidor. |
| Tipos no cliente | `RouterInputs` e `RouterOutputs` inferidos | Evita interfaces de resposta duplicadas e sujeitas a divergência. |
| Versionamento da API | Nenhum | Cliente e servidor são publicados juntos e não coexistem em versões independentes. |
| Erros | `TRPCError` com código e `errorFormatter` | Cria um formato único que a interface consegue tratar sem interpretar mensagens. |
| Paginação | Cursor com `useInfiniteQuery` | Evita inconsistências de offset sob escrita concorrente e se integra ao TanStack Query. |
| Consumidores externos | Fora de escopo | O contrato tRPC é interno ao monolito TypeScript. |
| Tempo real | Fora de escopo | As telas serão atualizadas por revalidação ou polling do TanStack Query. |

### Dados e persistência

| Item | Escolha | Justificativa |
|---|---|---|
| Banco | PostgreSQL gerenciado pelo Supabase | Oferece banco, autenticação e storage gerenciados sem operar servidores. |
| ORM | Prisma | Gera tipos a partir do schema e os propaga até os retornos do tRPC. |
| Migrations | Prisma Migrate como único dono do schema | Evita divergência causada por duas ferramentas alterando o mesmo schema. |
| RLS, policies e triggers | SQL bruto nas migrations do Prisma | Mantém objetos não modelados pelo Prisma na mesma linha do tempo versionada. |
| Cliente Prisma | Singleton global | Evita abrir clientes repetidos durante o hot reload do Next.js. |
| Conexão de runtime | Supavisor na porta 6543 com `pgbouncer=true` e `connection_limit=1` | Limita conexões por instância no ambiente serverless. |
| Conexão de migration | `directUrl` na porta 5432 | Executa migrations por uma conexão direta, fora do pool transacional. |
| Seed | `prisma/seed.ts`, idempotente | Permite repetir a preparação do ambiente e cria o tenant inicial `suporte_ti`. |

### Multi-tenancy

| Item | Escolha | Justificativa |
|---|---|---|
| Modelo | Banco único, tenant discriminado por coluna | O isolamento lógico atende ao escopo sem multiplicar schemas e migrations. |
| Identificador | `tenant_id` em toda tabela de domínio | Permite filtrar e proteger todos os dados pertencentes a um tenant. |
| Vínculo de usuário | `memberships (user_id, tenant_id, role)` | Permite que uma pessoa tenha papéis diferentes em tenants diferentes. |
| Tenant inicial | `suporte_ti`, criado pelo seed | Prepara de forma repetível o primeiro ambiente de uso. |
| Origem do tenant | Sessão resolvida no `createContext` | Impede que o cliente escolha ou altere o tenant pelo input. |
| Aplicação do filtro | `tenantProcedure` injeta o `tenant_id` no service | Reduz o risco de uma consulta esquecer o filtro de isolamento. |

A estrutura multi-tenant existirá desde o primeiro schema, mesmo que inicialmente
haja apenas um tenant. Adicioná-la depois exigiria backfill e revisão de todas as
consultas existentes.

### Autenticação e autorização

| Item | Escolha | Justificativa |
|---|---|---|
| Identidade | Supabase Auth com e-mail e senha | Atende ao contexto sem exigir uma infraestrutura própria de identidade. |
| Cadastro | Fechado, por convite de administrador | Impede cadastro público em um sistema interno sem domínio corporativo para validação. |
| Integração com Next.js | `@supabase/ssr` | Mantém a sessão disponível nas fronteiras de servidor do App Router. |
| Sessão | Cookies seguros gerenciados por `@supabase/ssr` | Evita usar `localStorage` como armazenamento manual de credenciais. |
| Renovação | Middleware do Next.js nas rotas protegidas | Atualiza a sessão durante a navegação e reduz expirações inesperadas. |
| Autorização | `protectedProcedure`, `tenantProcedure` e `adminProcedure` | As três regras necessárias cabem em middlewares explícitos do tRPC. |
| RLS | Habilitado em todas as tabelas, com negação por padrão | Acrescenta defesa em profundidade contra acesso indevido entre tenants. |
| Papel do RLS | Defesa em profundidade | A autorização primária ocorre no servidor, pois a conexão Prisma pode usar um papel que ignora RLS. |

### Testes e qualidade

| Item | Escolha | Justificativa |
|---|---|---|
| Runner | Vitest para servidor e componentes | Um runner cobre todo o monolito com uma configuração compartilhada. |
| Componentes | Testing Library | Verifica o comportamento observável da interface. |
| Integração com banco | Testcontainers com PostgreSQL real | Exercita constraints, transações, cascades e policies que mocks não reproduzem. |
| Procedimentos | `createCaller` do tRPC | Testa routers e middlewares sem a sobrecarga de iniciar um servidor HTTP. |
| E2E | Playwright | Cobre no navegador os fluxos críticos de login, empréstimo, devolução e operação. |
| Isolamento | Um caso por procedimento garantindo que o tenant A não veja o tenant B | Torna verificável a propriedade de segurança mais crítica do sistema. |
| Cobertura | Sem percentual mínimo | A exigência será cobrir caminhos críticos, não otimizar uma métrica. |
| Lint e formatação | ESLint e Prettier | Uma configuração atende a todo o repositório. |
| Pré-commit | lint-staged e husky apenas para lint e formatação | Interrompe erros triviais antes do CI sem aumentar a cerimônia dos commits. |
| Commits | Sem commitlint | Não haverá changelog automático que justifique impor um formato. |

### Execução, hospedagem e operação

| Item | Escolha | Justificativa |
|---|---|---|
| Execução local | Aplicação Next.js local e PostgreSQL real via container nos testes | Mantém o fluxo local próximo ao ambiente real sem exigir serviços manuais para a suíte. |
| Hospedagem | Vercel, em um projeto | É o ambiente nativo do Next.js e fornece build, preview e roteamento sem adapter. |
| Plano inicial | Hobby, somente enquanto o uso for acadêmico e não comercial | Atende à demonstração; qualquer uso institucional exige rever o plano antes da adoção. |
| Região das functions | Padrão disponível no plano escolhido | Aceita-se inicialmente a latência entre functions e banco como limitação do contexto acadêmico. |
| Região do Supabase | `sa-east-1` (São Paulo) | Mantém os dados na região definida para o projeto. |
| Limite de execução | 60 segundos por requisição | Operações potencialmente grandes devem ser desenhadas em lotes. |
| Filas e agendamento | Fora de escopo | Não há volume assíncrono conhecido na primeira versão. |
| Configuração | Variáveis de ambiente validadas com Zod no boot | Falha cedo quando uma configuração obrigatória está ausente ou inválida. |
| Logs | JSON estruturado com `request_id` e `tenant_id` | Permite correlacionar chamadas e investigar incidentes por tenant. |
| Erros | Sentry | Centraliza captura, contexto e rastreamento de falhas de produção. |
| CI | GitHub Actions | Automatiza as verificações do repositório e a aplicação de migrations. |
| Migration em deploy | `prisma migrate deploy` no CI, antes do deploy | Impede que várias instâncias serverless tentem migrar simultaneamente durante o boot. |

### Segurança

| Item | Escolha | Justificativa |
|---|---|---|
| Cabeçalhos HTTP | Configurados em `next.config.js` | Centraliza proteções previsíveis sem middleware adicional. |
| CSP | Restritiva, sem `unsafe-inline` | Reduz o impacto de injeção de scripts em uma sessão autenticada. |
| Rate limit | Por IP e usuário, com estado compartilhado no PostgreSQL | Contadores em memória não são confiáveis entre instâncias serverless. |
| Segredos | Variáveis de ambiente da Vercel, sem prefixo `NEXT_PUBLIC_` | Evita incluir credenciais no bundle do navegador. |
| Chave `service_role` | Exclusiva do código de servidor | Essa chave ignora RLS e não pode alcançar o cliente. |
| Auditoria | Tabela append-only com ator, tenant, ação e recurso | Preserva evidência de quem alterou cada recurso. |

## Alternativas descartadas

| Alternativa | Motivo do descarte |
|---|---|
| Front-end e API em projetos separados | Criariam CORS, dois deploys e uma fronteira HTTP sem equipes separadas para justificá-los. |
| REST com OpenAPI | Acrescentaria geração e versionamento de cliente que o tRPC dispensa dentro do monolito. |
| GraphQL | O custo de schema, resolvers e cache não se paga no volume atual de telas. |
| Server Actions para mutação | Criariam um segundo caminho de validação e autorização. |
| Server Components acessando Prisma diretamente | Duplicariam o caminho de leitura e a checagem de tenant. |
| Cliente Supabase como acesso principal aos dados | Espalharia o acesso por dois mecanismos e retiraria os tipos Prisma do fluxo tRPC. |
| RLS como autorização primária | Exigiria configurar papel e claims por transação para a conexão usada pelo Prisma. |
| Supabase CLI como dono das migrations | Criaria dois donos concorrentes do schema. |
| Cadastro público | Qualquer pessoa com a URL poderia criar conta no sistema interno. |
| SSO corporativo | Não há identidade corporativa federada disponível no contexto atual. |
| Sessão manual em `localStorage` | Expõe credenciais ao JavaScript e é desnecessária para uma aplicação de mesma origem. |
| CASL ou outra biblioteca de políticas | As regras atuais são atendidas por três middlewares do tRPC. |
| Zustand ou Redux | O pouco estado exclusivamente local não compensa uma store adicional. |
| MUI, Mantine ou outra biblioteca visual fechada | O design precisaria se sobrepor às decisões visuais da biblioteca. |
| Fila como BullMQ ou pg-boss | Não há carga assíncrona conhecida nem worker de longa duração na hospedagem escolhida. |
| Schema ou banco por tenant | Multiplicaria migrations sem requisito de isolamento que justifique o custo. |
| Prisma mockado nos testes de integração | Não exercitaria o comportamento real do PostgreSQL. |

## Consequências

### O que fica mais fácil

- Alterações incompatíveis entre procedimentos e telas são detectadas no build.
- Front-end e servidor usam a mesma origem, sem CORS e com sessão centralizada.
- Uma funcionalidade completa pode ser alterada em um único pull request.
- Há apenas um projeto de deploy, um pipeline e um runner principal de testes.
- Interface e servidor são publicados de forma atômica.
- O isolamento entre tenants tem aplicação centralizada e testes obrigatórios.

### O que fica mais difícil

- Front-end e servidor não podem ser escalados ou publicados separadamente.
- A fronteira entre código de servidor e cliente exige cuidado para não expor segredos.
- O projeto abre mão de buscar dados diretamente em Server Components para manter um único caminho via tRPC.
- Functions e banco em regiões diferentes acrescentam latência a cada acesso aos dados.
- Cold starts e o limite de execução afetam operações longas.
- Sem fila, integrações externas executadas durante uma requisição aumentam o tempo de resposta.
- Middlewares de autorização e policies de RLS precisam permanecer coerentes.

### O que não poderá ser feito depois sem custo

- Consumidores que não sejam TypeScript exigirão uma API adicional, como REST.
- Tempo real com conexão persistente exigirá outro serviço ou ambiente de execução.
- Processamento longo e trabalhos agendados exigirão fila e workers externos.
- Separar front-end e servidor exigirá substituir o acoplamento de tipos do tRPC.
- Trocar o Prisma afetará migrations e o SQL de RLS mantido nelas.
- Sair do Supabase envolverá migrar banco, autenticação e policies.
- Federar identidade corporativa exigirá migrar ou vincular os usuários existentes.
- O plano Hobby deverá ser substituído antes de qualquer uso institucional ou comercial.

## O que este ADR não decide

- Estrutura detalhada de pastas além dos pontos registrados nesta decisão.
- Modelagem de domínio, entidades e relacionamentos.
- Design system, tokens e identidade visual.
- Papéis e matriz detalhada de permissões dentro de cada tenant.
- Provisionamento de tenants e fluxo de convite de usuários.
- Provedor de e-mail e outras integrações.
- Estratégia de backup, retenção e recuperação.
- Quantidade de ambientes, promoção entre eles e política de branches.
- Feature flags.
- Métricas, tracing distribuído, SLOs, metas de latência e orçamento.
- Decisões de LGPD, incluindo base legal, retenção e exclusão de dados.

Esses temas devem ser decididos em ADRs próprios quando se tornarem necessários
ou caros de alterar.
