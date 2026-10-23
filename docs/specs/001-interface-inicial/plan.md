# Plano — Interface inicial do EmpresTI

**Status:** recorte de login aprovado; demais telas aguardam aprovação

**Spec:** `docs/specs/001-interface-inicial/spec.md`

## Recorte aprovado em 19/10/2026

O usuário aprovou a entrega de login com validação local e publicação na Vercel.
Executar somente T03, incluindo os tokens e a fonte necessários para essa tela;
não executar o shell nem as outras telas da T02 e T04–T08.

1. Criar `/login` com o layout Nocturne, hero e formulário acessível.
2. Redirecionar `/` para `/login`; manter o envio demonstrativo no login,
   conforme o recorte atualizado na spec.
3. Restaurar as dependências existentes com `npm ci`, sem adicionar pacotes;
   verificar testes, lint, build e arquivos alterados.
4. Publicar a versão verificada na Vercel e confirmar o endereço resultante.

A publicação foi solicitada expressamente pelo usuário para este recorte e
substitui somente a proibição de deploy do plano original nesta entrega.
Não executar commits, pushes, migrations ou alterações em bancos.

## Restrições técnicas

Este plano segue o ADR-001:

- monolito TypeScript com Next.js e App Router;
- TypeScript em modo `strict`;
- React e estado local com `useState`/Context quando necessário;
- Tailwind CSS para estilização;
- shadcn/ui para primitivas acessíveis e customizáveis;
- Vitest e Testing Library para testes de componentes;
- sem Server Actions e sem acesso direto a dados nesta entrega.

Também respeita as regras locais: nenhuma dependência será instalada sem nova
autorização; nenhum deploy, migration, segredo, commit ou push será realizado.

## Estrutura prevista do scaffold

Antes da geração, será solicitada autorização específica. O scaffold deverá
criar apenas a base necessária:

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
components/ui/
lib/
public/
components.json
eslint.config.*
next.config.*
package.json
postcss.config.*
tsconfig.json
```

Arquivos de rotas, componentes do produto, mocks e testes serão adicionados em
tarefas posteriores. O conteúdo efetivo gerado será revisado antes de qualquer
implementação de tela.

## Estratégia de implementação

### 1. Base do projeto

- Gerar projeto Next.js App Router em TypeScript strict com Tailwind e ESLint.
- Inicializar shadcn/ui de forma não interativa sobre Radix.
- Adicionar somente as primitivas usadas: Button, Input, Label, Badge, Card,
  Dialog, Table, Select, Textarea e Separator.
- Adicionar Phosphor Icons conforme a decisão visual existente.
- Registrar no `AGENTS.md` apenas comandos executados com sucesso.

### 2. Tema e shell

- Traduzir a paleta e os tokens de `docs/layout.md` para `app/globals.css`.
- Configurar Open Sans com `next/font` ou mecanismo local compatível com CSP.
- Criar componentes de shell: marca, sidebar, navegação, header, breadcrumb,
  busca e bloco de usuário.
- Manter o shell como Server Component sempre que não houver estado local.

### 3. Dados de demonstração

- Criar tipos de equipamento, empréstimo e histórico.
- Centralizar os registros demonstrativos citados no layout.
- Derivar contagens e estados dos mesmos mocks para evitar divergência entre
  telas.

### 4. Rotas e telas

- Implementar Login isoladamente do shell autenticado.
- Implementar Catálogo e Detalhe com componentes reutilizáveis.
- Implementar Meus empréstimos.
- Implementar Operações e Cadastro.
- Usar Client Components somente nos menores limites que precisam de filtros,
  diálogo, formulário ou atualização de prévia.

### 5. Estados e acessibilidade

- Validar estado ativo da navegação pela rota.
- Garantir diálogo acessível com foco controlado.
- Implementar interações demonstrativas sem simular sucesso persistente.
- Cobrir foco, rótulos, estados desabilitados e movimento reduzido.

### 6. Verificação

- Criar testes comportamentais associados aos critérios de aceitação.
- Rodar os comandos definidos pelo scaffold para testes e build.
- Conferir `git status --short` e garantir que apenas o escopo da tarefa atual
  foi alterado.
- Fazer verificação visual local somente depois que uma primeira tela coerente
  compilar; não publicar nem alterar a Vercel.

## Riscos e controles

- **Conflito entre layout e stack:** a aparência vem de `docs/layout.md`, mas a
  implementação usa Tailwind e shadcn/ui conforme o ADR-001.
- **Escopo crescer para backend:** nenhum controle chamará API nesta spec.
- **Componentes genéricos alterarem o visual:** primitivas shadcn serão
  tematizadas e compostas com os tokens do produto, sem manter o tema padrão.
- **Client Components em excesso:** estado ficará restrito aos componentes
  interativos.
- **Dependências desnecessárias:** cada pacote será apresentado antes da
  instalação e deve estar previsto no ADR-001 ou no layout.

## Condição para começar o código

1. Aprovação deste plano.
2. Autorização explícita para gerar o scaffold e instalar as dependências.
3. Execução de uma única tarefa de `tasks.md` por vez.

