# Catálogo e empréstimos

Status: implementação validada localmente. Parecer formal e verificação
do Storage do deploy pendentes. As regras seguem o PRD, a spec 002 e as
decisões confirmadas da prática.

Uma pessoa com sessão e vínculo ativo abre o Catálogo e pode consultar os
próprios empréstimos em aberto. As consultas usam o tenant e o vínculo do
contexto autenticado. O cliente não escolhe esses identificadores.

O catálogo mostra patrimônio, nome, categoria, local de retirada e
disponibilidade. Um item pode ser solicitado quando estiver em estado
operacional disponível e sem empréstimo aberto. Os itens da prática usam
o manifesto de imagens e exibem o crédito “Fotos: Pixabay” com link.

Confirmar a solicitação cria imediatamente um empréstimo aberto. A devolução
vence 14 dias corridos após a retirada. Uma pessoa com três empréstimos
abertos ou com um vencido em aberto não pode solicitar outro. O servidor
revalida a disponibilidade e as regras ao receber cada solicitação.

## Critérios propostos

- CA-01: uma pessoa autenticada vê os dados e a disponibilidade dos itens
  do próprio tenant. Quem estiver sem sessão não obtém os dados.
- CA-02: a solicitação válida cria o empréstimo e a auditoria na mesma
  transação. O prazo fica 14 dias corridos após a retirada.
- CA-03: a solicitação é recusada se o item estiver emprestado, em manutenção
  ou retirado de circulação, ou se pertencer a outro tenant.
- CA-04: o servidor bloqueia a quarta solicitação ou qualquer solicitação
  de quem já tem empréstimo aberto vencido.
- CA-05: duas solicitações simultâneas para o mesmo item têm no máximo um
  sucesso. Duas solicitações para itens diferentes, quando a pessoa já
  tem dois empréstimos, também têm no máximo um sucesso.
- CA-06: a lista de empréstimos abertos mostra somente os do próprio
  vínculo, com o item e a data prevista de devolução.
- CA-07: as fotos aprovadas aparecem no catálogo, com correspondência por
  patrimônio e crédito visível ao Pixabay.

Devolução, reserva, renovação e operação administrativa seguem fora deste
recorte.
