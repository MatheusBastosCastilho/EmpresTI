# Prática SDD do EmpresTI

[Repositório](https://github.com/MatheusBastosCastilho/EmpresTI) ·
[Projeto em produção](https://empres-ti-beryl.vercel.app/login)

A revisão `5e26c66` está publicada e foi validada em produção.
O [registro da validação](docs/evidencias/pratica-local.md#validação-na-vercel-em-09112026)
documenta o login docente, as fotos e o teste de empréstimo com conta separada.
O critério CA-03 da spec 004 verifica o acesso docente com a senha padrão
do enunciado, o vínculo de colaborador e os zero empréstimos da conta.
O parecer final aprovou todos os critérios de login, dados iniciais e catálogo.

## Decisões

| Questão | Decisão | Evidência |
| --- | --- | --- |
| Limite de empréstimos | Três por pessoa, conforme o PRD. | [PRD](docs/prd.md) e [spec 005](docs/specs/005-catalogo-emprestimos/spec.md) |
| Prazo | 14 dias corridos, decisão confirmada pelo usuário. | [Spec 005](docs/specs/005-catalogo-emprestimos/spec.md) e trigger da migration inicial |
| Manutenção inicial | TI-0004, TI-0007 e TI-0010. | [Spec 004](docs/specs/004-dados-iniciais/spec.md) e [seed](prisma/seed.ts) |
| Local de retirada | Balcão de Suporte TI, confirmado pelo usuário. | [Spec 004](docs/specs/004-dados-iniciais/spec.md) |
| Fonte e crédito | Pixabay por decisão do usuário. O catálogo exibe o crédito e o manifesto rastreia autoria e licença. | [Skill](.agents/skills/imagens-equipamentos/SKILL.md) e [manifesto](data/equipment-photos.json) |
| Padronização de imagens | O PowerShell usa System.Drawing do Windows e mede o JPEG final. | [Script da skill](.agents/skills/imagens-equipamentos/scripts/Prepare-Photos.ps1) |
| Conta docente | O operador provisiona no Supabase Auth. O seed recebe o UUID e valida o vínculo. | [Spec 004](docs/specs/004-dados-iniciais/spec.md) |
| Independência do verificador | Só apresenta evidências e resultados por critério. O agente principal corrige. | [Perfil](.codex/agents/spec_verifier.toml) e [regra de fechamento](rules/checks.md) |

O agente propôs permitir retoque localizado nas duas últimas fotos. O usuário
escolheu manter o filtro estrito. Depois dessa decisão, uma foto de câmera de
videoconferência foi aprovada como representação da webcam. As rejeições e os
IDs revisados ficaram no [plano da prática](docs/plan-pratica-sdd.md).

## Alternativas consideradas

- Adotar o número cinco do enunciado exigiria alterar o PRD. Manter três
  preserva a regra aprovada e exige proteger a corrida por itens diferentes.
- Contar dias úteis exigiria calendário, feriados e fuso como parte do contrato.
  O prazo corrido preserva a migration e a decisão do usuário.
- Instalar `sharp` traria outra dependência ao projeto. Para o preparo local,
  o System.Drawing já disponível gera o JPEG e permite medir o resultado.
- Gravar URL ou foto em cada registro exigiria ampliar o schema para esta
  prática. O manifesto resolve as 12 fotos pelo patrimônio e mantém a
  procedência separada do estado operacional.
- Permitir correção pelo verificador misturaria execução e avaliação.
  Sessões separadas com revisão congelada permitem comparar o mesmo critério
  antes e depois da correção.

## Skill, verificador e evidências

- A skill descreve o fluxo de seleção e o filtro visual. A referência detalha
  a operação e a entrega dos arquivos. O script consulta a API, mantém cache,
  transforma e valida dimensões e duplicatas, e gera o manifesto. O operador
  publica os objetos aprovados no Storage.
- O verificador recebe uma spec e o diff de uma revisão Git em sessão efêmera.
  O comando de fechamento exige parecer de todos os critérios. A rodada
  registrada do login demonstrativo bloqueou seis critérios sem evidência.
  O limite foi alterado de três para quatro em um snapshot isolado. O verificador
  reprovou CA-04 e CA-05. Voltando à versão correta, aprovou ambos. O resultado
  inicial usou hashes de árvores Git. A repetição sobre o commit
  `0d447f9d9700b10b16579a3601959b7580cda5d5` reprovou CA-04 e CA-05.
  A reversão `f7f6f24da51b4d32b2e4c8129147d60f088ef7da` restaurou
  exatamente a árvore anterior.
  [Tabelas do verificador](docs/evidencias/verificador-pratica.md)
- No parecer sobre o commit de reversão, os oito critérios de login foram
  aprovados. Nos dados iniciais, CA-03 aguarda evidência da conta docente real
  e da entrega privada da credencial naquele parecer. No catálogo, CA-07 ainda
  aguardava as URLs do Storage no deploy. Os resultados operacionais posteriores
  estão no registro da validação em produção.
- O login foi validado por HTTP com contas descartáveis no Supabase local.
  A renovação preservou o horário de autenticação. O PostgreSQL descartável
  verificou o controle de tentativas. O verificador apontou replay de token
  pós-logout. A proteção passou a consultar a sessão no Auth e o teste HTTP
  confirmou que o mesmo cookie retorna 401 depois de sair.
  [Evidências locais](docs/evidencias/pratica-local.md)
- O seed foi executado duas vezes no banco de teste. A segunda rodada preservou
  o item retirado de circulação, o empréstimo aberto de outra conta e a ausência
  de empréstimos docentes. [Teste do seed](tests/seed.test.ts)
- Os testes do catálogo exercitam isolamento, disponibilidade, prazo, auditoria,
  vencimento, limite pessoal e concorrência. [Teste do catálogo](tests/catalog.test.ts)
- A câmera TI-0012 é representada por uma câmera de ação compacta do Pixabay.
  O JPEG final passou pelo mesmo filtro estrito e pela validação de dimensões
  e hash aplicada às outras 11 fotos. Os 12 objetos no Storage local
  responderam publicamente com os hashes do manifesto.

A prática pôs à prova o smoke do schema, que contava apenas as seis tabelas
de domínio. A tabela de tentativas ganhou verificações separadas de RLS,
política explícita e permissões. O smoke continua protegendo a contagem do
domínio. [Smoke PostgreSQL](prisma/tests/dev-smoke.sql)

## Fechamento da entrega

1. No ambiente autorizado, o operador aplica migrations, provisiona as contas
   no Supabase Auth, executa o seed e envia os JPEGs para o bucket público
   `empres-ti-equipamentos`. Os objetos usam os caminhos do manifesto.
2. O operador configura as variáveis da spec 003 no ambiente Vercel escolhido.
   Conferir as 12 URLs públicas, o acesso docente e o fluxo de empréstimo
   com conta separada. Conferir que o docente permanece com zero empréstimos.
3. Consultar o registro da validação e o parecer das três specs.
4. Publicar a tag `entrega-pratica` na revisão que contém as evidências
   e registrar o link da versão publicada.
