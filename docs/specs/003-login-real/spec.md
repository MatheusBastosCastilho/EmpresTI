# Login real

Status: escopo funcional, parâmetros de segurança e DDL do controle de
tentativas aprovados em 09/11/2026. Implementação validada localmente.
O parecer formal aguarda uma revisão candidata registrada no Git.
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
- Neste recorte, o vínculo existente em `suporte_ti` representa uma
  membership ativa. Uma sessão revogada no Supabase perde o acesso mesmo
  se alguém reapresentar um token ainda dentro do prazo.
- O colaborador acessa somente os próprios dados; Operações tem ações por papel.
- A tela mantém o layout aprovado e envia as credenciais ao procedimento de login.
- Após autenticar uma conta com membership ativa, redirecionar para o Catálogo.
- Quem estiver sem acesso procura Operações. A resposta pública mantém a
  mensagem genérica e evita revelar quais contas existem.
- A conta do professor é provisionada como colaborador de `suporte_ti`.
  Os testes de empréstimo usam outra conta.
- A sessão dura no máximo oito horas desde a autenticação. Renovar o token
  durante o uso sem estender esse prazo.
- Aplicar janela de 15 minutos para falhas de login. Bloquear novas tentativas
  após cinco falhas por conta ou vinte por IP, com contagem compartilhada no
  PostgreSQL. A resposta não identifica qual limite foi atingido.

## Critérios de aceitação propostos

- LOGIN-01: sem sessão, uma rota protegida exige autenticação.
- LOGIN-02: credenciais válidas de conta ativa criam sessão em cookie httpOnly.
- LOGIN-03: credenciais inválidas não criam sessão e apresentam mensagem genérica.
- LOGIN-04: conta sem membership ativa não acessa dados do tenant.
- LOGIN-05: o contexto ignora tentativas de trocar o tenant pelo input.
- LOGIN-06: o logout encerra a sessão e impede reutilizar a rota protegida.

- LOGIN-07: renovar o token preserva o limite original de oito horas.
- LOGIN-08: tentativas simultâneas respeitam ambos os limites, incluindo
  contas inexistentes. Após expirar a janela, o acesso pode ser tentado novamente.

## Fora de escopo

Cadastro público, recuperação de senha, login social, MFA, “lembrar de mim”,
SSO, catálogo completo, empréstimo, devolução, reserva futura, e-mail de
notificação e importação de planilha.

## Contrato afetado

`/login`, sessão, contexto tRPC e proteção das rotas de produto. A tabela
`dev.login_attempts` é exclusiva do controle de acesso. O modelo de empréstimos,
o prazo de 14 dias e o limite de três itens seguem as regras existentes.
O endpoint de infraestrutura `/health` permanece público e não retorna dados de usuários.

## Configuração do ambiente

`npm run up` lê a URL e a chave pública do Supabase local e injeta no processo
do Next. A chave HMAC dos limites locais é derivada do segredo do Auth local
com um rótulo dedicado. Os valores ficam em memória e o script não os imprime.
O provedor de e-mail está habilitado no Auth local e o cadastro global continua
desligado.

Em preview e produção, o operador fornece `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `LOGIN_RATE_LIMIT_KEY` no painel.
A última variável é exclusiva do servidor e requer 32 bytes aleatórios em
hexadecimal. As instâncias do mesmo ambiente usam a mesma chave.

## O que o andar zero já garante e não será reescrito

- AZ-02: conexão configurada e falha de banco observável; login trata o acesso,
  não a instalação do PostgreSQL.
- AZ-03: migrations versionadas e reproduzíveis; alterações futuras usam esse fluxo.
- AZ-05: comunicação entre front e endpoint provada pela página de infraestrutura.
- AZ-06: suíte e banco de teste isolado disponíveis para os critérios de login.
- AZ-07/AZ-08: configuração externa e ausência de segredos nos fontes.

Essas garantias dependem das evidências do fechamento em `docs/entrega-aulas.md`.
O andar zero não garante autenticação, autorização de produto nem uma sessão válida.
