# Spec — Interface inicial do EmpresTI

**Status:** recorte de login aprovado; demais telas aguardam aprovação

O comportamento demonstrativo registrado abaixo pertence à entrega original.
Para autenticação e sessão da prática SDD, vale a [spec 003](../003-login-real/spec.md).

**Origem:** `docs/prd.md` e `docs/layout.md`  
**Decisão técnica:** `docs/adr/001-stack.md`

## Objetivo

Construir a primeira versão navegável da interface do EmpresTI com as seis
telas definidas no layout, usando dados fictícios e estado local. Esta entrega
serve para validar aparência, hierarquia, navegação e interações antes da
integração com autenticação, API ou banco de dados.

## Recorte aprovado — login e publicação (19/10/2026)

Para a entrega atual, o usuário aprovou somente a tela de login, sua validação
local e a publicação na Vercel. Este recorte prevalece sobre o fluxo completo
descrito abaixo apenas nesta entrega:

- `/` redireciona para `/login`.
- `/login` segue o hero, as métricas e o formulário do layout Nocturne.
- E-mail e senha são obrigatórios; o e-mail usa validação nativa do navegador.
- A senha pode ser mostrada ou ocultada por um controle acessível.
- O envio válido permanece no login e informa que o acesso ainda não está
  habilitado. Não navega para o catálogo, que não integra esta entrega.
- Nenhuma credencial é enviada, registrada ou persistida pela aplicação.
- A autenticação real e as demais telas permanecem para etapas posteriores.
- Testes e build devem passar antes da publicação na Vercel solicitada pelo
  usuário. Não executar migrations, commits ou pushes.

Critérios aplicáveis: **CA-02** (somente login), **CA-09** e **CA-11**.

## Escopo

### Incluído

1. Login em `/login`.
2. Catálogo em `/catalogo`.
3. Detalhe de equipamento em `/catalogo/PAT-1042`.
4. Meus empréstimos em `/meus-emprestimos`.
5. Empréstimos em aberto em `/operacoes/emprestimos`.
6. Cadastro de equipamento em `/operacoes/equipamentos/novo`.
7. Navegação entre as telas pelos controles descritos no layout.
8. Dados fictícios tipados e consistentes entre catálogo, detalhe, histórico e
   visão de Operações.
9. Interações locais: filtros visuais, abertura e fechamento de confirmação,
   campos de formulário e prévia do equipamento.
10. Estados visuais disponível, emprestado, em manutenção e em atraso.

### Fora de escopo

- Supabase Auth, sessão real ou proteção de rotas.
- tRPC, Prisma, PostgreSQL, migrations ou persistência.
- Regras de negócio executadas no servidor.
- Envio real de login, solicitação, devolução ou cadastro.
- Reserva futura, notificação por e-mail e importação de planilha.
- Deploy, configuração da Vercel ou alteração de variáveis de ambiente.
- Layout específico para celular ou tablet nesta etapa.

## Decisões confirmadas

- As seis telas serão implementadas.
- A primeira etapa será uma interface navegável com dados fictícios.
- O layout será desktop-first, seguindo as dimensões de referência.
- A implementação seguirá o ADR-001: Next.js App Router, TypeScript strict,
  Tailwind CSS e componentes shadcn/ui.
- A orientação de estilos inline em `docs/layout.md` pertence ao protótipo de
  referência. Na aplicação real, tokens e estilos serão expressos com Tailwind
  e CSS global de tema, sem alterar o resultado visual especificado.
- O produto terá somente modo escuro, sem alternador.

## Requisitos funcionais da interface

### Login

- Exibir hero de marca, mensagem principal, limites operacionais e formulário.
- Campos de e-mail e senha devem possuir rótulos associados.
- O envio local deve navegar para o catálogo sem autenticação real.

### Catálogo

- Exibir busca, contador de itens da pessoa, aviso das regras e filtros.
- Mostrar seis equipamentos representando os estados definidos no layout.
- Equipamento disponível deve abrir seu detalhe.
- Equipamento indisponível não deve apresentar ação de solicitação.

### Detalhe do equipamento

- Exibir imagem simbólica, estado, descrição, ficha técnica e histórico.
- Exibir cálculo demonstrativo do prazo padrão de 14 dias.
- A ação de solicitar deve abrir um diálogo de confirmação.
- A confirmação local deve navegar para Meus empréstimos.

### Meus empréstimos

- Exibir dois itens atuais, limite de três e barras de prazo.
- Exibir ação de devolução apenas como interação demonstrativa local.
- Exibir histórico com situações no prazo e com atraso.

### Operações — empréstimos em aberto

- Exibir indicadores, filtros e tabela com sete linhas.
- Destacar visualmente empréstimos em atraso.
- Exibir paginação demonstrativa e ações de devolução locais.
- A ação de cadastro deve abrir a tela de novo equipamento.

### Operações — cadastrar equipamento

- Exibir os campos e o controle segmentado descritos no layout.
- Atualizar a prévia do catálogo conforme nome, categoria, patrimônio e estado.
- Não persistir nem enviar os dados nesta etapa.

## Requisitos visuais

- Reproduzir os tokens, espaçamentos, raios, tipografia, cores, estados e
  densidade definidos em `docs/layout.md`.
- Aplicar a paleta Nocturne adaptada por variáveis de tema reutilizáveis.
- Usar Open Sans como família tipográfica da interface.
- Usar Phosphor Icons com o mapeamento estabelecido no layout.
- Não usar sombras pesadas, gradientes agressivos, emojis, preto puro ou branco
  puro.
- Ações primárias devem permanecer contornadas, sem preenchimento sólido.
- Respeitar `prefers-reduced-motion`.

## Acessibilidade

- Manter navegação por teclado em links, campos, filtros, botões e diálogo.
- Exibir foco visível conforme o layout.
- Usar rótulos acessíveis para ícones sem texto.
- O diálogo deve ter título, descrição, foco inicial e fechamento por Escape.
- Estados não podem depender apenas de cor: devem conservar texto identificador.

## Critérios de aceitação

- **CA-01:** as seis rotas abrem a tela correspondente e a navegação principal
  liga os fluxos descritos nesta spec.
- **CA-02:** login e as cinco telas autenticadas reproduzem a estrutura, a
  hierarquia e o conteúdo representativo de `docs/layout.md`.
- **CA-03:** o shell autenticado possui sidebar de 236 px, header de 64 px,
  item ativo, grupos de navegação, contador e bloco de usuário.
- **CA-04:** o catálogo apresenta busca, aviso de regras, filtros e os estados
  disponível, emprestado e manutenção, sem oferecer ação indevida.
- **CA-05:** o detalhe apresenta ficha, histórico, limite da pessoa e diálogo
  acessível de confirmação com prazo de 14 dias.
- **CA-06:** Meus empréstimos apresenta limite, dois empréstimos correntes,
  progresso de prazo e histórico com situações distintas.
- **CA-07:** Operações apresenta quatro indicadores, sete empréstimos, destaque
  de atraso, filtros, ações locais e paginação demonstrativa.
- **CA-08:** o formulário de equipamento atualiza a prévia local sem persistir
  dados e comunica que manutenção não aparece no catálogo.
- **CA-09:** todos os elementos interativos possuem foco visível, nome acessível
  e comportamento de teclado compatível; movimento reduzido é respeitado.
- **CA-10:** os dados da demonstração ficam centralizados e tipados, sem acesso
  a Supabase, variáveis de ambiente ou serviços externos.
- **CA-11:** testes de componentes cobrem as interações críticas e os comandos
  de teste e build terminam sem falha.

