# ADR-002 — Sistema visual e estrutura de navegação

**Status:** aceito  
**Contexto do produto:** [`docs/prd.md`](../prd.md)  
**Referência visual:** [`docs/layout.md`](../layout.md)  
**Decisão técnica relacionada:** [`ADR-001`](001-stack.md)

## Contexto

O EmpresTI precisa apresentar seis telas coerentes para colaboradores e para a
equipe de Operações: login, catálogo, detalhe de equipamento, empréstimos do
colaborador, empréstimos em aberto e cadastro de equipamento.

O ADR-001 definiu Next.js, Tailwind CSS e shadcn/ui, mas não definiu a identidade
visual, a densidade da interface, a composição do shell autenticado nem como as
regras do negócio aparecem visualmente. Sem uma decisão comum, cada tela poderia
adotar cores, componentes e padrões de navegação diferentes.

`docs/layout.md` descreve a referência completa de aparência e interação. Este
ADR registra as decisões duradouras dessa referência sem duplicar todas as
medidas e tokens. Valores detalhados continuam pertencendo ao documento de
layout.

Existe uma divergência de implementação: o layout foi produzido como um
protótipo com estilos inline, enquanto o ADR-001 determina Tailwind CSS para a
aplicação. A implementação precisa preservar a aparência especificada sem criar
um segundo mecanismo de estilização.

## Decisão

### Identidade visual

A aplicação adotará o sistema visual **Nocturne**, adaptado à cor primária
`#001449`, exclusivamente em modo escuro.

- Não haverá modo claro nem alternador de tema na primeira versão.
- Fundos serão quase pretos e azulados; superfícies serão diferenciadas por
  bordas e variações de fundo, sem sombras pesadas.
- `#001449` será usado como fundo profundo de marca, hero, avatar e chips, não
  como cor de texto ou de ação sobre superfícies escuras.
- `#5B7FE0` será a cor de ação visível para bordas, foco, progresso e estados
  ativos.
- Ações primárias serão contornadas e transparentes. Preenchimento azul suave
  ficará restrito a confirmação, hover e estados ativos previstos no layout.
- Gradientes ficarão limitados ao hero do login, à faixa de regras e à área
  visual do equipamento.
- A interface não usará preto ou branco puros, emojis ou efeitos decorativos
  que não comuniquem estado ou hierarquia.

As cores, bordas, raios, sombras, espaçamentos e escalas tipográficas serão
expressos como tokens reutilizáveis. Os valores normativos são os definidos em
`docs/layout.md`.

### Implementação do tema

A aplicação seguirá a stack do ADR-001:

- Tailwind CSS será o mecanismo de estilização da aplicação.
- Os tokens compartilhados serão declarados no tema global e consumidos por
  classes utilitárias e pelos componentes.
- shadcn/ui fornecerá as primitivas acessíveis; seus arquivos permanecerão no
  repositório e serão customizados para o Nocturne.
- Não será mantido o tema padrão gerado pelo shadcn/ui como aparência final.
- Estilos inline não serão o mecanismo da aplicação. A orientação de estilos
  inline em `docs/layout.md` aplica-se somente ao template de protótipo que deu
  origem à referência visual.
- Valores arbitrários de Tailwind serão admitidos quando representarem medidas
  normativas do layout que não tenham um token semântico equivalente.

Essa interpretação preserva o resultado visual do layout e evita contrariar o
ADR-001.

### Tipografia e iconografia

- Open Sans será a única família tipográfica, nos pesos 400, 500, 600 e 700,
  com `system-ui, sans-serif` como fallback.
- Títulos usarão peso 600; peso 700 não será usado em títulos.
- A fonte será carregada pelo mecanismo de fontes do Next.js, evitando uma
  dependência de folha de estilos remota durante o uso da aplicação.
- Phosphor Icons será o conjunto de ícones do produto, com peso regular por
  padrão e peso fill apenas no item ativo da navegação.
- O mapeamento entre ações, categorias e ícones seguirá `docs/layout.md`.

### Estrutura das telas autenticadas

As telas autenticadas compartilharão um único shell:

- sidebar fixa de 236 px;
- área principal com header de 64 px;
- conteúdo alinhado à esquerda e organizado com Grid ou Flexbox e `gap`;
- navegação dividida nos grupos Colaborador e Operações;
- Operações continuará sendo uma seção do mesmo produto, não uma aplicação
  separada;
- estado ativo será comunicado por fundo, texto, ícone fill e marcador lateral;
- breadcrumb será usado nas páginas de segundo nível.

O login ficará fora desse shell e usará a composição dividida entre hero e
formulário. A primeira versão será desktop-first e seguirá as dimensões de
referência do layout. Comportamentos específicos para celular e tablet exigirão
uma decisão posterior.

As rotas da aplicação serão:

| Tela | Rota |
|---|---|
| Login | `/login` |
| Catálogo | `/catalogo` |
| Detalhe do equipamento | `/catalogo/:patrimonio` |
| Meus empréstimos | `/meus-emprestimos` |
| Empréstimos em aberto | `/operacoes/emprestimos` |
| Cadastrar equipamento | `/operacoes/equipamentos/novo` |

### Componentes e estados

Botões, inputs, chips, pills, cards, tabelas, diálogos, barras de prazo e
indicadores de limite terão as variantes normativas descritas em
`docs/layout.md`.

Os estados disponível, emprestado, manutenção e atraso usarão pares próprios de
texto, fundo e borda. O estado nunca dependerá apenas de cor: continuará
identificado por texto.

As regras de negócio decididas no PRD serão visíveis de forma consistente:

- limite de três itens por pessoa;
- prazo padrão de 14 dias;
- bloqueio de novo empréstimo quando houver atraso;
- indisponibilidade de equipamentos em manutenção.

O layout comunica essas regras, mas não as executa. Validação, autorização e
persistência continuam sendo responsabilidades das camadas definidas no
ADR-001.

### Movimento e acessibilidade

O movimento será discreto e funcional, limitado às transições descritas no
layout e com duração máxima de 240 ms.

- Nada se moverá automaticamente.
- Foco de teclado será imediato e visível.
- `prefers-reduced-motion` removerá transições de opacidade e transformação.
- Controles com ícone sem texto terão nome acessível.
- Diálogos controlarão foco, terão título e descrição e poderão ser fechados
  por teclado.
- Estados desabilitados e semânticos preservarão indicação textual.

### Linguagem da interface

A interface será escrita em português do Brasil. A copy será curta, seca e
operacional, sem exclamações, emojis ou mensagens informais. Datas visíveis
usarão o formato `dd/mmm`, como `14/set`.

## Alternativas descartadas

| Alternativa | Motivo do descarte |
|---|---|
| Tema claro ou alternador de tema | Aumentaria estados visuais e esforço de validação sem requisito no PRD. |
| Tema padrão do shadcn/ui | Não representa a identidade Nocturne nem a densidade definida para o produto. |
| Estilos inline na aplicação | Contrariam a decisão de Tailwind CSS do ADR-001 e dificultam tokens e variantes compartilhadas. |
| CSS Modules como mecanismo principal | Criariam um segundo padrão de estilização sem necessidade conhecida. |
| Biblioteca visual opinativa | Foi descartada no ADR-001 porque exigiria sobrepor o design do produto. |
| Botões primários sólidos | Contrariam a hierarquia visual contornada definida para o Nocturne. |
| Ícones diferentes por tela ou biblioteca | Reduziriam consistência e aumentariam a quantidade de recursos visuais. |
| Aplicação separada para Operações | Duplicaria navegação e estrutura sem necessidade de produto ou deploy independente. |
| Interface mobile completa nesta etapa | O layout atual define somente a experiência desktop; decidir breakpoints sem referência criaria comportamento não aprovado. |

## Consequências

### O que fica mais fácil

- Novas telas podem reutilizar tokens, primitivas e o shell autenticado.
- Estados operacionais permanecem reconhecíveis entre catálogo, empréstimos e
  Operações.
- A implementação consegue reproduzir o layout sem abandonar Tailwind e
  shadcn/ui.
- Foco, contraste, movimento reduzido e estados semânticos passam a ter regras
  comuns.
- A navegação entre as áreas do colaborador e de Operações mantém uma única
  identidade de produto.

### O que fica mais difícil

- Componentes padrão do shadcn/ui precisam ser customizados antes de serem
  usados como componentes finais.
- O modo exclusivamente escuro exige validar contraste em todas as combinações
  de texto, borda e estado.
- Medidas específicas e alta densidade exigem atenção para não introduzir
  espaçamentos e raios arbitrários.
- Uma experiência mobile futura precisará adaptar tabelas, sidebar e grids sem
  descaracterizar a hierarquia definida para desktop.

### O que não poderá mudar sem custo

- Introduzir modo claro exigirá uma segunda paleta completa e revisão visual de
  todas as telas e estados.
- Trocar Open Sans ou Phosphor Icons afetará hierarquia, métricas e alinhamento
  dos componentes.
- Separar Operações em outro produto exigirá duplicar ou extrair o shell e seus
  componentes compartilhados.
- Substituir ações contornadas por botões sólidos alterará a hierarquia visual
  em toda a aplicação.

## O que este ADR não decide

- Breakpoints e composição final para celular ou tablet.
- Contratos de propriedades e organização interna dos componentes React.
- Estratégia de testes de regressão visual.
- Regras de autenticação, autorização, dados ou persistência.
- Conteúdo definitivo dos registros exibidos nas telas.
- Evolução da marca além da primeira versão do EmpresTI.
