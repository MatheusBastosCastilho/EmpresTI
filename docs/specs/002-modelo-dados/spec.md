# Spec — Modelo de dados inicial

**Status:** proposta para aprovação  
**Origem:** `docs/prd.md`  
**Decisão técnica:** `docs/adr/001-stack.md`

## Objetivo

Definir o primeiro schema do EmpresTI para autenticação por Supabase Auth,
isolamento por tenant, catálogo de equipamentos, empréstimos, devoluções e
auditoria. O schema deve suportar as regras da primeira versão sem introduzir
reserva futura, histórico de manutenção ou importação da planilha.

## Decisões confirmadas

- A confirmação de uma solicitação cria imediatamente um empréstimo aberto;
  não existe aprovação ou estado pendente.
- Os papéis são `COLLABORATOR` e `OPERATIONS` por tenant.
- A membership armazena nome de exibição obrigatório e departamento opcional.
- Patrimônio é obrigatório e único dentro do tenant; número de série é
  opcional.
- Categorias são registros administráveis por tenant.
- Local de retirada é texto livre nesta versão.
- O equipamento armazena somente o estado operacional `AVAILABLE`,
  `MAINTENANCE` ou `RETIRED`.
- “Emprestado” é derivado da existência de um empréstimo sem devolução.
- Colaborador e Operações podem registrar devolução; o registro guarda ator e
  horário.
- Não haverá histórico de manutenção na primeira versão.
- O banco impede dois empréstimos abertos para o mesmo equipamento.
- O limite de três itens e o bloqueio por atraso são validados na camada
  Service dentro de transação.
- Equipamentos com histórico não são apagados; passam para `RETIRED`.
- Prisma Migrate é o único dono do schema. RLS, policies e triggers ficam no
  SQL da migration Prisma.

## Escopo

### Incluído

- Tenant inicial e isolamento multi-tenant.
- Vínculo entre usuário do Supabase Auth e tenant.
- Papéis de colaborador e Operações.
- Categorias de equipamento.
- Cadastro e estado operacional de equipamentos.
- Empréstimos e devoluções.
- Auditoria append-only.
- Constraints, índices, chaves estrangeiras compostas e timestamps.
- Row Level Security com negação por padrão e policies explícitas.
- Seed idempotente do tenant `suporte_ti` e categorias iniciais.
- Testes de integração com PostgreSQL real.

### Fora de escopo

- Reserva com data futura ou fila de espera.
- Aprovação de solicitação.
- Renovação ou extensão do prazo.
- Histórico de manutenção.
- Exclusão física de equipamento com histórico.
- Notificação por e-mail.
- Importação da planilha atual.
- Provisionamento completo de tenants e convites.
- Alterações no Supabase remoto.

## Modelo conceitual

### `tenants`

Representa uma organização isolada. A primeira instalação cria `suporte_ti`.

### `memberships`

Relaciona `auth.users` a um tenant e define papel, nome de exibição e
departamento. Um usuário possui no máximo uma membership por tenant.

### `equipment_categories`

Mantém categorias administráveis, com nome único por tenant.

### `equipment`

Representa uma unidade física. Patrimônio é único por tenant. O estado salvo é
operacional; disponibilidade para empréstimo também depende da ausência de
empréstimo aberto.

### `loans`

Registra retirada, vencimento, devolução e quem registrou a devolução. Um
equipamento pode possuir vários empréstimos históricos, mas apenas um aberto.
Atraso é derivado de `returned_at IS NULL AND due_at < now()`.

### `audit_logs`

Registra ator, ação, tipo e identificador do recurso, metadados e horário. As
linhas não podem ser atualizadas nem removidas.

## Integridade

- Toda tabela pertencente a um tenant contém `tenant_id`; a tabela raiz
  `tenants` é a única exceção.
- Relações entre tabelas de domínio usam chaves compostas para impedir vínculo
  entre tenants diferentes.
- `asset_tag` é único por tenant.
- Categoria é única por tenant sem distinguir maiúsculas de minúsculas.
- Um índice único parcial impede mais de um empréstimo aberto por equipamento.
- Prazo é definido como retirada mais 14 dias ao criar o empréstimo.
- Campos de devolução são ambos nulos ou ambos preenchidos.
- Identidade, equipamento, pessoa, retirada e prazo de um empréstimo tornam-se
  imutáveis após a criação.
- Exclusões são restritas quando apagariam histórico.

## Segurança e RLS

- Todas as tabelas têm RLS habilitada e pelo menos uma policy explícita.
- Tenant só pode ser lido por seus membros.
- Membership pode ser lida pelo próprio usuário ou por Operações do tenant.
- Categoria e equipamento podem ser lidos por qualquer membro do tenant.
- Escrita de categoria e equipamento é permitida apenas a Operações.
- Empréstimo pode ser lido pelo titular ou por Operações.
- O titular pode criar o próprio empréstimo e registrar a própria devolução;
  Operações pode registrar devoluções do tenant.
- Auditoria pode ser lida apenas por Operações e não admite update ou delete.
- A autorização primária continua no servidor; RLS é defesa em profundidade,
  conforme o ADR-001.

## Regras na camada Service

Antes de criar um empréstimo, a Service executa em transação:

1. confirma que o equipamento pertence ao tenant e está `AVAILABLE`;
2. confirma que não existe empréstimo aberto para o equipamento;
3. confirma que a pessoa possui menos de três empréstimos abertos;
4. confirma que a pessoa não possui empréstimo aberto vencido;
5. cria o empréstimo e o evento de auditoria.

O índice único parcial protege a concorrência por equipamento. A Service deve
usar bloqueio transacional adequado para serializar solicitações simultâneas da
mesma pessoa e garantir o limite de três itens.

## Critérios de aceitação

- **CA-01:** existem tabelas para tenants, memberships, categorias,
  equipamentos, empréstimos e auditoria, com relações multi-tenant válidas.
- **CA-02:** patrimônio é único por tenant e não é possível relacionar registros
  de tenants diferentes.
- **CA-03:** não é possível manter dois empréstimos abertos para o mesmo
  equipamento.
- **CA-04:** prazo de um novo empréstimo é calculado em 14 dias e atraso é
  derivável sem coluna redundante.
- **CA-05:** devolução guarda horário e membership responsável, preservando o
  histórico do empréstimo.
- **CA-06:** todas as tabelas têm RLS e policies que respeitam titular,
  Operações e tenant.
- **CA-07:** auditoria é append-only e registra ator, ação e recurso.
- **CA-08:** o seed cria de forma idempotente o tenant `suporte_ti` e as
  categorias iniciais.
- **CA-09:** uma recriação completa do banco local aplica todas as migrations e
  o seed sem intervenção manual.
- **CA-10:** testes provam constraints, regras críticas e isolamento entre dois
  tenants.
