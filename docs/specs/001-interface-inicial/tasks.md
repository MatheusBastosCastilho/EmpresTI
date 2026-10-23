# Tarefas — Interface inicial do EmpresTI

Cada tarefa cabe em um commit do usuário. O agente executará somente uma tarefa
por autorização e parará depois dos checks e do relato do resultado.

## T01 — Criar a base Next.js

**Critérios:** CA-01, CA-11  
**Pré-condição:** aprovação do plano e autorização para instalar dependências.

- Mostrar o comando e a lista de arquivos esperados.
- Gerar o scaffold Next.js com TypeScript strict, App Router, Tailwind e ESLint.
- Inicializar shadcn/ui e adicionar somente as primitivas aprovadas.
- Instalar Phosphor Icons.
- Validar testes/build disponíveis e registrar apenas comandos bem-sucedidos.

## T02 — Implementar tema e shell autenticado

**Critérios:** CA-02, CA-03, CA-09

- Aplicar tokens, tipografia, reset e movimento reduzido.
- Criar sidebar, header, busca, breadcrumb e bloco de usuário.
- Criar páginas mínimas das rotas autenticadas para validar navegação ativa.
- Testar estrutura e nomes acessíveis do shell.

## T03 — Implementar a tela de Login

**Critérios:** CA-02 (login), CA-09, CA-11

**Recorte aprovado:** login e publicação, conforme `spec.md` e `plan.md`, em 19/10/2026.

- Criar hero, métricas e formulário.
- Redirecionar `/` para `/login`.
- Validar e-mail e senha, com controle acessível de visibilidade da senha.
- Exibir mensagem de demonstração após envio válido, sem autenticação ou
  navegação para o catálogo nesta entrega.
- Testar campos, rótulos e envio por teclado.
- Publicar na Vercel após a validação; não executar commits ou pushes.

**Resultado em 23/10/2026:** login publicado em
https://empres-ti-beryl.vercel.app/login e verificado no navegador. Testes
(`Tests 4 passed (4)`), lint e build passaram. Sem commits ou pushes.

## T04 — Implementar dados fictícios e Catálogo

**Critérios:** CA-04, CA-10

- Criar tipos e registros de demonstração centralizados.
- Criar aviso, filtros e cards dos três estados.
- Ligar equipamento disponível ao detalhe.
- Testar filtros e ausência de ação em itens indisponíveis.

## T05 — Implementar Detalhe e confirmação

**Critérios:** CA-05, CA-09, CA-10

- Criar área visual, ficha, histórico e coluna lateral.
- Criar diálogo acessível de confirmação.
- Navegar localmente para Meus empréstimos após confirmação.
- Testar prazo, limite e comportamento do diálogo.

## T06 — Implementar Meus empréstimos

**Critérios:** CA-06, CA-09, CA-10

- Criar resumo do limite, lista atual e barras de prazo.
- Criar histórico e estados visuais.
- Implementar devolução demonstrativa local e testar o comportamento.

## T07 — Implementar Operações

**Critérios:** CA-07, CA-09, CA-10

- Criar indicadores, filtros, tabela e paginação demonstrativa.
- Destacar atrasos e disponibilizar ações locais de devolução.
- Ligar ação de cadastro à rota de novo equipamento.
- Testar filtro, destaque e navegação.

## T08 — Implementar Cadastro de equipamento

**Critérios:** CA-08, CA-09, CA-10

- Criar formulário, controle segmentado e notas operacionais.
- Atualizar a prévia conforme o estado local.
- Exibir últimos cadastros fictícios.
- Testar a prévia e a mensagem sobre manutenção.

## T09 — Verificação integrada da interface

**Critérios:** CA-01 a CA-11

- Rodar a suíte completa e o build.
- Verificar os fluxos de navegação entre as seis telas.
- Conferir foco, diálogo e movimento reduzido.
- Conferir `git status --short` e documentar o handoff da última tarefa.

