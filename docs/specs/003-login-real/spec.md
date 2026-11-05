# Rascunho — primeira funcionalidade real: login

Status: rascunho para a próxima aula, sem autorização para implementação.
O login é a primeira funcionalidade real porque identifica a pessoa antes de
expor empréstimos próprios e ações de Operações.

O nome `003` preserva as specs `001-interface-inicial` e `002-modelo-dados`
preexistentes. Corresponde ao exercício de primeira funcionalidade da aula 8;
não significa que login real já esteja implementado.

## Objetivo e vínculo

Permitir acesso de pessoas convidadas por e-mail e senha. PRD: “Login. Cada
pessoa vê os próprios empréstimos”. ADR-001: Supabase Auth, sessão em cookie
httpOnly, cadastro fechado, autorização e tenant no contexto tRPC.

## Regras

- Somente contas convidadas acessam o sistema; não há cadastro público.
- Credenciais são validadas pelo Supabase Auth, nunca por tabela de senhas própria.
- A sessão não é persistida em localStorage ou sessionStorage.
- O tenant é resolvido da sessão e da membership, nunca de um input confiado.
- O colaborador acessa somente os próprios dados; Operações tem ações por papel.
- A tela mantém o layout aprovado. O formulário atual é apenas demonstrativo.

## Critérios de aceitação propostos

- LOGIN-01: sem sessão, uma rota protegida exige autenticação.
- LOGIN-02: credenciais válidas de conta ativa criam sessão em cookie httpOnly.
- LOGIN-03: credenciais inválidas não criam sessão e apresentam mensagem genérica.
- LOGIN-04: conta sem membership ativa não acessa dados do tenant.
- LOGIN-05: o contexto ignora tentativas de trocar o tenant pelo input.
- LOGIN-06: o logout encerra a sessão e impede reutilizar a rota protegida.

Os critérios dependentes das perguntas abaixo serão refinados com o time antes
de implementar, sem completar lacunas de negócio por conta própria.

## Perguntas classificadas

1. Negócio: qual destino após entrar, Catálogo ou Meus empréstimos?
2. Negócio: qual canal deve atender quem não recebeu convite ou foi desativado?
3. Técnica: qual duração e política de renovação da sessão?
4. Técnica: qual limite de tentativas e período do bloqueio no login?
5. Fora de escopo a confirmar: recuperação de senha entra agora?
6. Fora de escopo: login social, MFA e “lembrar de mim” continuam fora da primeira versão?

## Fora de escopo

Cadastro público, SSO, catálogo completo, empréstimo, devolução, reserva futura,
e-mail de notificação e importação de planilha. Não implementar estas telas ao
executar o andar zero.

## Contrato afetado

`/login`, sessão, contexto tRPC e proteção das rotas de produto. Não alterar o
modelo de dados, o prazo de 14 dias nem o limite de três itens nesta funcionalidade.
O endpoint de infraestrutura `/health` permanece público e não retorna dados de usuários.

## O que o andar zero já garante e não será reescrito

- AZ-02: conexão configurada e falha de banco observável; login trata o acesso,
  não a instalação do PostgreSQL.
- AZ-03: migrations versionadas e reproduzíveis; alterações futuras usam esse fluxo.
- AZ-05: comunicação entre front e endpoint provada pela página de infraestrutura.
- AZ-06: suíte e banco de teste isolado disponíveis para os critérios de login.
- AZ-07/AZ-08: configuração externa e ausência de segredos nos fontes.

Essas garantias dependem das evidências do fechamento em `docs/entrega-aulas.md`.
O andar zero não garante autenticação, autorização de produto nem uma sessão válida.
