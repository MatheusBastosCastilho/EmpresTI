# Dados iniciais da prática

Status: seed validado em PostgreSQL descartável e manifesto com 12 fotos
aprovadas. Upload no deploy e parecer formal pendentes.

O tenant `suporte_ti` recebe os 12 patrimônios da lista da prática. Cada
equipamento mantém nome e categoria da lista e começa no Balcão de Suporte TI.
TI-0004, TI-0007 e TI-0010 começam em manutenção. Os nove restantes começam
disponíveis. A preparação não cria empréstimos.

A conta docente especificada no enunciado entra como colaboradora desse
tenant e começa com zero empréstimos. O operador provisiona o usuário no
Supabase Auth e informa seu UUID ao seed. A credencial fica fora do seed e
do Git. A conta usada para testar empréstimos é separada.

Cada foto aprovada no manifesto corresponde a um patrimônio. A proposta é
usar a chave estável `equipamentos/<patrimônio>.jpg` em um bucket público.
O catálogo resolve as fotos do lote pelo manifesto e pelo patrimônio, sem
alterar a tabela de equipamentos para esta entrega. O operador faz o upload
ao Storage do deploy usando os nomes do manifesto.

O seed cria registros ausentes e preserva registros em uso. Se um patrimônio
existente divergir dos metadados previstos, reporta a divergência. Um novo
seed não reativa um equipamento nem muda o papel de uma conta existente.

## Critérios propostos

- CA-01: há 12 patrimônios únicos no tenant, com os nomes e as categorias da
  prática e retirada no Balcão de Suporte TI.
- CA-02: três itens começam em manutenção, nove em disponibilidade e nenhum
  empréstimo é criado.
- CA-03: o usuário docente tem vínculo de colaborador e zero empréstimos.
  A credencial é entregue pelo operador fora do repositório.
- CA-04: rodar o seed duas vezes não duplica registros e preserva empréstimos,
  vínculos e estados operacionais existentes.
- CA-05: cada item aponta para uma foto distinta, revisada e com 800×600.
  Origem, autoria, licença e hash são rastreáveis no manifesto.

## Operação

Depois de provisionar o usuário docente e aplicar as migrations no ambiente
local, execute `npm run db:generate` e
`node prisma/seed.ts <UUID-docente>`. O comando retorna a quantidade prevista
de itens, divergências de metadados e a quantidade de empréstimos docentes.

No deploy, o operador roda o mesmo comando com `--operator-remote` e injeta
`DIRECT_URL` com TLS e `schema=dev` no próprio processo. Use o UUID docente
do ambiente escolhido. A execução remota faz parte da operação humana.

## Evidência local

`tests/seed.test.ts` validou CA-01 a CA-04 em PostgreSQL descartável.
Após a primeira execução, uma segunda conta recebeu um empréstimo aberto e
outro item foi retirado de circulação. A segunda execução do seed preservou
os dois estados, manteve os 12 patrimônios e deixou a conta docente sem
empréstimos. Para CA-05, o [manifesto](../../../data/equipment-photos.json)
identifica os 12 arquivos validados localmente. Os objetos do Storage local
responderam HTTP 200 sem credenciais. O upload no deploy ainda é pendente.
