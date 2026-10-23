# EmpresTI â€” EspecificaÃ§Ã£o de Layout (para reproduÃ§Ã£o por agente de IA)

Documento de referÃªncia do front-end do EmpresTI (emprÃ©stimo de equipamentos internos).
Base visual: design system **Nocturne** adaptado Ã  primÃ¡ria `#001449`.
**Somente modo escuro.** NÃ£o existe modo claro, nem alternador de tema.

---

## 1. PrincÃ­pios visuais

1. Fundo quase preto azulado; superfÃ­cies elevadas por *borda + escurecimento ambiente*, nunca por sombra pesada.
2. AÃ§Ãµes primÃ¡rias sÃ£o **contornadas** (borda de 1px + fundo transparente), nunca preenchidas com cor sÃ³lida.
3. A primÃ¡ria `#001449` Ã© usada como **fundo profundo** (marca, hero do login, avatares, chips ativos), nÃ£o como cor de texto ou de botÃ£o â€” em fundo escuro ela nÃ£o tem contraste suficiente.
4. A cor de aÃ§Ã£o visÃ­vel Ã© `#5B7FE0` (mesma famÃ­lia, mais clara).
5. Baixa saturaÃ§Ã£o fora do azul de aÃ§Ã£o; cinzas azulados carregam superfÃ­cies, bordas e texto secundÃ¡rio.
6. Alinhamento Ã  esquerda, layouts densos, tÃ­tulos flush-left.
7. Nada de gradiente agressivo, emoji ou preto/branco puros.

---

## 2. Cores

### 2.1 Base

| Token | Hex | Uso |
|---|---|---|
| `--page` | `#05070F` | Fundo da moldura/documento (fora do app) |
| `--color-bg` | `#080C1A` | Fundo da aplicaÃ§Ã£o |
| `--sidebar-bg` | `#060A16` | Fundo da sidebar (mais escuro que o app) |
| `--color-surface` | `#0E1530` | Cards, painÃ©is, linhas de destaque |
| `--surface-sunken` | `#0B1128` | Inputs, cabeÃ§alho de tabela, cards internos, blocos de apoio |
| `--color-text` | `#E6EAF6` | Texto principal |
| `--text-muted` | `#8A93B2` | Texto secundÃ¡rio / descriÃ§Ãµes |
| `--text-dim` | `#7C86A2` | Metadados (categoria, patrimÃ´nio) |
| `--text-faint` | `#5E6884` | RÃ³tulos uppercase, datas, textos de apoio |
| `--text-ghost` | `#454E68` | RÃ³tulos de grupo na sidebar, "(opcional)" |

### 2.2 Bordas e divisores

| Token | Hex | Uso |
|---|---|---|
| `--border-frame` | `#222C4A` | Contorno externo da tela, inputs, chips inativos |
| `--border-card` | `#1F2949` | Borda de cards |
| `--border-soft` | `#1A2340` | Divisor de sidebar/header, blocos de apoio |
| `--border-row` | `#161D33` | Linhas internas de tabelas e listas |
| `--border-strong` | `#2B3450` | Inputs de formulÃ¡rio, botÃ£o secundÃ¡rio |

### 2.3 Rampa da primÃ¡ria (derivada de #001449)

| Token | Hex | Uso |
|---|---|---|
| `--accent-100` | `#EEF2FE` | Texto em hover de botÃ£o primÃ¡rio |
| `--accent-200` | `#D6E0FB` | Texto de chip ativo / botÃ£o de confirmaÃ§Ã£o |
| `--accent-300` | `#B4C6F6` | Texto de botÃ£o primÃ¡rio, valores destacados |
| `--accent-400` | `#8AA6EE` | Ãcones, links, Ã­cone ativo da sidebar |
| `--accent-500` | `#5B7FE0` | **Cor de aÃ§Ã£o**: bordas de botÃ£o primÃ¡rio, barras de progresso, marca ativa |
| `--accent-600` | `#3C5DBE` | Hover de borda de card, Ã­cone grande de hero |
| `--accent-700` | `#25408F` | Borda de aviso, borda do logo, borda de chip ativo |
| `--accent-800` | `#132663` | Fundo de chip ativo, avatar, badge de contagem |
| `--accent-900` | `#001449` | **PrimÃ¡ria** â€” fundo do logo e do painel do login |

### 2.4 Estados semÃ¢nticos

| Estado | Texto | Fundo | Borda |
|---|---|---|---|
| DisponÃ­vel | `#5FD3AA` | `rgba(63,185,140,0.12)` | `rgba(63,185,140,0.35)` |
| Emprestado | `#9AA3BC` | `#1A2340` | `#2B3450` |
| ManutenÃ§Ã£o | `#E8B961` | `rgba(224,163,63,0.12)` | `rgba(224,163,63,0.35)` |
| Atraso | `#F0A0A5` (rÃ³tulo `#E08A90`) | linha: `rgba(224,91,98,0.05)` | `rgba(224,91,98,0.4)` |

### 2.5 Cinzas de interface (rampa neutra)

`#F2F4FA` Â· `#DFE3EE` Â· `#C4CADB` Â· `#9AA3BC` Â· `#7C86A2` Â· `#5E6884` Â· `#454E68` Â· `#2B3450` Â· `#161D33`
(100 â†’ 900; o passo 400 `#9AA3BC` Ã© o texto de item inativo da sidebar.)

### 2.6 ElevaÃ§Ã£o

```
--shadow-sm: 0 0 0 1px #222C4A;
--shadow-md: 0 0 0 1px #2B3450, 0 6px 18px rgba(0,0,0,0.55);
--shadow-lg: 0 0 0 1px #454E68, 0 18px 44px rgba(0,0,0,0.7);
```
Moldura de tela usa `0 0 0 1px #222C4A, 0 18px 44px rgba(0,0,0,0.6)`. DiÃ¡logo usa `--shadow-lg`. Nunca empilhar sombras.

### 2.7 Gradientes permitidos (apenas trÃªs)

- Hero do login: `linear-gradient(160deg,#001449 0%,#00102F 60%,#080C1A 100%)`
- Faixa de aviso de regras: `linear-gradient(90deg,#0E1530,#0B1128)`
- Ãrea de imagem do item: `radial-gradient(120% 120% at 20% 0%,#132663 0%,#0B1128 60%)`

### 2.8 Divisores com esmaecimento (assinatura do Nocturne)

RÃ©guas horizontais desaparecem nas pontas em vez de terminarem retas:

```css
/* rÃ©gua de largura total */
background: linear-gradient(to right,
  rgba(230,234,246,0), #222C4A 48px,
  #222C4A calc(100% - 48px), rgba(230,234,246,0));
height: 1px;

/* rÃ©gua-marca (sÃ³ Ã  direita) */
background: linear-gradient(to right, #3C5DBE, rgba(60,93,190,0));
```
Divisores curtos internos (linhas de tabela, borda de sidebar) sÃ£o sÃ³lidos.

### 2.9 Links

```css
a { color:#8AA6EE; text-decoration:none }
a:hover { color:#B4C6F6 }
```

---

## 3. Tipografia

- FamÃ­lia Ãºnica: **Open Sans** (`400, 500, 600, 700`), fallback `system-ui, sans-serif`. TÃ­tulos e corpo usam a mesma famÃ­lia.
- Pesos usados: **400** (corpo) e **600** (tÃ­tulos, rÃ³tulos, valores). Nunca 700 em tÃ­tulos.
- `letter-spacing: -0.01em` em tÃ­tulos; `0.02em` em nomes de marca; `0.08em`â€“`0.12em` em rÃ³tulos uppercase.
- `text-wrap: pretty` em parÃ¡grafos longos.

### Escala

| Papel | Tamanho | Peso | Cor |
|---|---|---|---|
| TÃ­tulo do documento | 40px / 1.1 | 600 | `#E6EAF6` |
| TÃ­tulo do hero (login) | 34px / 1.15 | 600 | `#E6EAF6` |
| TÃ­tulo de item (detalhe) | 28px | 600 | `#E6EAF6` |
| TÃ­tulo de pÃ¡gina (H1 interno) | 24px | 600 | `#E6EAF6` |
| MÃ©trica de card de estatÃ­stica | 26px | 600 | `#E6EAF6` |
| NÃºmero de destaque (hero) | 24px | 600 | `#E6EAF6` |
| TÃ­tulo de seÃ§Ã£o (H2 do doc) | 17px | 600 | `#E6EAF6` |
| TÃ­tulo de diÃ¡logo | 19px | 600 | `#E6EAF6` |
| TÃ­tulo de subseÃ§Ã£o | 15px | 600 | `#E6EAF6` |
| Nome de item em lista | 15px | 600 | `#E6EAF6` |
| Nome de item em card | 14.5px | 600 | `#E6EAF6` |
| Corpo / input / cÃ©lula | 13â€“14px | 400 | `#E6EAF6` |
| DescriÃ§Ã£o | 13â€“13.5px | 400 | `#8A93B2` |
| Metadados | 12â€“12.5px | 400 | `#7C86A2` |
| RÃ³tulo de campo | 12px | 400 | `#9AA3BC` |
| Item de navegaÃ§Ã£o | 13px | 400 | `#9AA3BC` (ativo: `#E6EAF6`) |
| Badge / pill de estado | 11px | 600 | conforme estado |
| RÃ³tulo uppercase | 11px, `letter-spacing:.08â€“.1em` | 400 | `#5E6884` |
| RÃ³tulo de grupo (sidebar) | 10px, `letter-spacing:.12em` | 400 | `#454E68` |
| Nota de apoio | 11.5px | 400 | `#5E6884` |

MÃ­nimo absoluto: 10px, e somente para rÃ³tulos uppercase de agrupamento.

---

## 4. EspaÃ§amento, raios e proporÃ§Ãµes

### 4.1 Escala de espaÃ§amento (densidade 0.7Ã—)

Valores em uso: `3 Â· 5 Â· 6 Â· 7 Â· 8 Â· 9 Â· 10 Â· 12 Â· 14 Â· 16 Â· 18 Â· 20 Â· 22 Â· 26 Â· 28 Â· 32 Â· 40 Â· 56 Â· 64`px.
Sempre `display:flex` / `grid` + `gap` â€” nunca margens por elemento nem espaÃ§o por whitespace.

### 4.2 Raios

| Raio | Uso |
|---|---|
| `14px` | Moldura de tela, diÃ¡logo |
| `12px` | Cards, contÃªiner de tabela, blocos laterais |
| `11px` | Cards de estatÃ­stica, card interno de prÃ©via |
| `10px` | Bloco de usuÃ¡rio na sidebar, Ã­cone de item em lista (44px) |
| `9px` | Ãcone de item em card (40px), blocos internos |
| `8px` | BotÃµes, inputs, itens de navegaÃ§Ã£o, logo |
| `7px` | BotÃ£o de tabela (30px), paginaÃ§Ã£o, logo pequeno |
| `99px` | Pills, avatares, barras de progresso |

### 4.3 Molduras de tela

| Tela | DimensÃ£o |
|---|---|
| 01 Login | 1440 Ã— 820 |
| 02 CatÃ¡logo | 1440 Ã— 900 |
| 03 Detalhe do item | 1440 Ã— 900 |
| 04 Meus emprÃ©stimos | 1440 Ã— 820 |
| 05 OperaÃ§Ãµes | 1440 Ã— 900 |
| 06 Cadastrar equipamento | 1440 Ã— 820 |

### 4.4 Estrutura do app (telas 02â€“06)

```
grid-template-columns: 236px 1fr    /* sidebar | main */
```

- **Sidebar** 236px: fundo `#060A16`, `border-right:1px solid #1A2340`, padding `22px 14px`, `gap:26px`.
  - Marca: Ã­cone 28Ã—28 (raio 7px, fundo `#001449`, `box-shadow:0 0 0 1px #25408F`), texto 14px/600, `gap:10px`, padding lateral 8px.
  - Nav: `flex-direction:column; gap:3px`. Item: padding `9px 10px`, raio 8px, Ã­cone 16px, `gap:10px`.
  - RÃ³tulo de grupo: padding `0 8px 6px` (primeiro) / `18px 8px 6px` (seguintes).
  - Bloco de usuÃ¡rio: `margin-top:auto`, padding 12px, raio 10px, fundo `#0B1128`, borda `#1A2340`; avatar 28px circular fundo `#132663` com iniciais 11px/600 em `#B4C6F6`.
- **Header do main**: altura fixa **64px**, `border-bottom:1px solid #1A2340`, padding lateral 28px, `align-items:center`.
  - Busca: altura 36px, `max-width:400â€“420px`, raio 8px, fundo `#0B1128`, borda `#222C4A`, Ã­cone + placeholder em `#5E6884`, `gap:8px`.
  - AÃ§Ã£o do header: altura 34px, padding lateral 14px.
- **ConteÃºdo**: padding `26â€“32px 28px`, `flex-direction:column; gap:20â€“22px`.

### 4.5 Alturas de controles

| Controle | Altura |
|---|---|
| BotÃ£o principal de formulÃ¡rio/login | 44px (padding lateral 20px) |
| Input / select / campo | 42px (padding lateral 12px) |
| BotÃ£o de diÃ¡logo | 38px (padding lateral 16px) |
| BotÃ£o em linha de lista | 36px (padding lateral 16px) |
| Busca e aÃ§Ã£o de header | 34â€“36px |
| BotÃ£o em linha de tabela | 30px |
| Textarea | 88px, `resize:none`, padding `10px 12px` |
| Barra de progresso | 4px (linha) / 5px (segmentos) |

### 4.6 Grids internos

- CatÃ¡logo: `repeat(3,1fr)`, `gap:16px`. Card: padding 16px, `gap:12px`.
- Cards de estatÃ­stica (OperaÃ§Ãµes): `repeat(4,1fr)`, `gap:14px`, padding `16px 18px`.
- Detalhe do item: `1fr 356px`, `gap:32px`. Imagem: altura 260px.
- FormulÃ¡rio de cadastro: `1fr 320px`, `gap:40px`; formulÃ¡rio interno `1fr 1fr`, `gap:18px`, largura mÃ¡x. 620px; campos largos usam `grid-column: span 2`.
- Ficha tÃ©cnica do item: `repeat(4,1fr)`, `gap:20px`.
- Tabela de OperaÃ§Ãµes: `1.3fr 1.1fr 120px 120px 150px 110px`, `gap:16px`, linha `padding:13px 18px`, cabeÃ§alho `padding:12px 18px`.
- HistÃ³rico do colaborador: `1fr 150px 150px 130px`, `gap:16px`.
- Lista "Comigo agora": linha `padding:18px 20px`, `gap:18px`; Ã­cone 44px; coluna de prazo 180px.

### 4.7 Larguras de texto

ParÃ¡grafos limitados por `max-width` em ch: `20ch` (tÃ­tulo de hero), `38ch` (subtÃ­tulo de hero), `56ch` (descriÃ§Ã£o do documento), `60ch` (descriÃ§Ã£o de item).

---

## 5. Componentes

### 5.1 BotÃµes

| Variante | Borda | Fundo | Texto | Hover |
|---|---|---|---|---|
| PrimÃ¡rio | `1px solid #5B7FE0` | transparente | `#B4C6F6` 600 | `background:rgba(91,127,224,0.12); color:#EEF2FE` |
| ConfirmaÃ§Ã£o (diÃ¡logo) | `1px solid #5B7FE0` | `rgba(91,127,224,0.12)` | `#D6E0FB` 600 | `background:rgba(91,127,224,0.2)` |
| SecundÃ¡rio | `1px solid #2B3450` | transparente | `#9AA3BC` | `color:#E6EAF6; border-color:#454E68` |
| AÃ§Ã£o de linha | `1px solid #2B3450` | transparente | `#D6E0FB` 600 | `border-color:#5B7FE0; background:rgba(91,127,224,0.1)` |
| AÃ§Ã£o de linha em atraso | `1px solid #5B7FE0` | `rgba(91,127,224,0.14)` | `#D6E0FB` 600 | `background:rgba(91,127,224,0.24)` |

Foco de teclado sempre `outline:2px solid #5B7FE0; outline-offset:2px`. Desabilitado: `opacity:0.45`.

### 5.2 Pill de estado

`font-size:11px; font-weight:600; padding:3px 9px; border-radius:99px` + trio de cores da seÃ§Ã£o 2.4.

### 5.3 Chips de filtro

Altura implÃ­cita por `padding:6px 12px`, raio 99px, 12px.
- Ativo: fundo `#132663`, texto `#D6E0FB`, borda `#25408F`.
- Inativo: fundo transparente, texto `#9AA3BC`, borda `#222C4A`.

### 5.4 Card de equipamento (catÃ¡logo)

Coluna: Ã­cone 40Ã—40 (raio 9px, fundo `#0B1128`, Ã­cone 20px `#8AA6EE`) + pill de estado no canto oposto â†’ nome 14.5px/600 â†’ meta 12px `#7C86A2` â†’ rodapÃ© de 12px.
- DisponÃ­vel: rodapÃ© "Solicitar â†’" em `#8AA6EE`, card clicÃ¡vel, hover `border-color:#3C5DBE`.
- Emprestado: rodapÃ© "Com {pessoa} Â· devolve {data}" em `#5E6884`, sem hover.
- ManutenÃ§Ã£o: rodapÃ© com situaÃ§Ã£o da assistÃªncia, sem hover.

### 5.5 Input

`height:42px; padding:0 12px; border-radius:8px; border:1px solid #2B3450; background:#0B1128; color:#E6EAF6; font-size:14px; font-family:inherit`.
Select falso: mesmo box + `<i class="ph ph-caret-down">` 13px `#5E6884` Ã  direita.

### 5.6 Controle segmentado

ContÃªiner `border:1px solid #2B3450; border-radius:8px; overflow:hidden; width:fit-content`; opÃ§Ãµes `padding:9px 18px`, 13px, separadas por `border-left:1px solid #2B3450`. Ativo: fundo `#132663`, texto `#D6E0FB`, peso 600.

### 5.7 Tabela

CabeÃ§alho: fundo `#0B1128`, texto 11px uppercase `letter-spacing:.08em` `#5E6884`. Linhas separadas por `border-top:1px solid #161D33`. ContÃªiner: raio 12px, borda `#1A2340`, `overflow:hidden`. Linha em atraso recebe `background:rgba(224,91,98,0.05)`.

### 5.8 Faixa de aviso de regras (topo do catÃ¡logo)

`padding:13px 16px; border-radius:10px; background:linear-gradient(90deg,#0E1530,#0B1128); border:1px solid #25408F`; Ã­cone `ph-info` 17px `#8AA6EE`; tÃ­tulo 13px/600 + corpo 12.5px `#9AA3BC`; `gap:12px`.

### 5.9 DiÃ¡logo

Backdrop `rgba(4,6,14,0.68)` cobrindo a tela, conteÃºdo centralizado. Caixa: 432px, padding 24px, raio 14px, fundo `#0E1530`, `--shadow-lg`. TÃ­tulo 19px/600 â†’ corpo 13.5px `#8A93B2` â†’ bloco de consequÃªncia (`padding:12px 14px`, raio 9px, fundo `#0B1128`, borda `#1A2340`, 12.5px `#9AA3BC`) â†’ aÃ§Ãµes alinhadas Ã  direita, `gap:10px`.

### 5.10 Indicadores de limite

- Segmentos de 3 (limite de itens): trÃªs divs `flex:1; height:5px; border-radius:99px`, `gap:5px`; preenchidos `#5B7FE0`, vazios `#222C4A`.
- Barra de prazo: trilha `height:4px; background:#222C4A; border-radius:99px; overflow:hidden`; preenchimento `#5B7FE0` na proporÃ§Ã£o de dias decorridos / 14.

### 5.11 Ãcones

Phosphor Icons (`@phosphor-icons/web`), pesos *regular* (padrÃ£o) e *fill* (apenas item ativo da sidebar).
Mapeamento: marca `ph-package` Â· catÃ¡logo `ph-squares-four` Â· meus emprÃ©stimos `ph-hand-arrow-down` Â· operaÃ§Ãµes `ph-list-checks` Â· cadastro `ph-plus-square` Â· notebook `ph-laptop` Â· monitor `ph-monitor` Â· cÃ¢mera `ph-video-camera` Â· cabo/dock `ph-usb` Â· projetor `ph-projector-screen` Â· busca `ph-magnifying-glass` Â· filtro `ph-funnel` Â· aviso `ph-info` Â· breadcrumb `ph-caret-right` Â· select `ph-caret-down` Â· avanÃ§o `ph-arrow-right` Â· adicionar `ph-plus` Â· notificaÃ§Ã£o `ph-bell`.
Tamanhos: 12px (breadcrumb) Â· 13px (caret) Â· 15â€“16px (nav/marca) Â· 17px (header, aviso) Â· 19â€“21px (Ã­cone de item) Â· 64px (hero do item).

---

## 6. PÃ¡ginas

### 01 Â· Login (1440Ã—820)
Split `560px | 1fr`.
- **Esquerda** â€” hero em `linear-gradient(160deg,#001449,#00102F 60%,#080C1A)`, padding 56px, `justify-content:space-between`: marca no topo (Ã­cone 34px, texto 16px) Â· bloco central com tÃ­tulo 34px (mÃ¡x. 20ch), subtÃ­tulo 14px `#93A0C6` (mÃ¡x. 38ch), rÃ©gua-marca esmaecida, dois nÃºmeros (3 itens por pessoa / 14 dias de prazo) com `gap:40px` Â· rodapÃ© "OperaÃ§Ãµes Â· v1" 11px.
- **Direita** â€” formulÃ¡rio centralizado de 372px, padding 56px: "Entrar" 22px/600, subtÃ­tulo 13px, campos e-mail + senha (`gap:18px`), botÃ£o primÃ¡rio 44px com `ph-arrow-right`, rÃ©gua esmaecida, nota de suporte 12px centralizada.

### 02 Â· CatÃ¡logo (1440Ã—900)
Sidebar + header (busca, "2 de 3 itens com vocÃª", `ph-bell`).
ConteÃºdo: H1 "CatÃ¡logo" + contagem ("32 equipamentos Â· 11 disponÃ­veis agora") â†’ **faixa de aviso de regras** (limite de 3, prazo de 14 dias, bloqueio por atraso, manutenÃ§Ã£o fora do catÃ¡logo) â†’ chips de categoria + "SÃ³ disponÃ­veis" Ã  direita â†’ grid 3Ã—2 de cards mostrando os trÃªs estados.

### 03 Â· Detalhe do item (1440Ã—900)
Sidebar + header com breadcrumb (CatÃ¡logo â€º Notebooks â€º item) e contador Ã  direita.
ConteÃºdo `1fr 356px`:
- Coluna principal: bloco de imagem 260px com Ã­cone 64px â†’ tÃ­tulo 28px + pill de estado â†’ descriÃ§Ã£o (mÃ¡x. 60ch) â†’ rÃ©gua esmaecida â†’ ficha tÃ©cnica em 4 colunas (Categoria, PatrimÃ´nio, Local, Ãšltima devoluÃ§Ã£o) â†’ "HistÃ³rico" em linhas `data | evento | resultado`.
- Coluna lateral: card **Solicitar emprÃ©stimo** (Retirada / Prazo padrÃ£o 14 dias / Devolver atÃ© â€” valor em `#B4C6F6` 600 â€” botÃ£o 44px + nota de retirada) e card **Seus itens** com "2 de 3", segmentos de limite e nota de status.
- Sobreposto: diÃ¡logo de confirmaÃ§Ã£o (Â§5.9) com o prazo calculado e o aviso de que o colaborador chegarÃ¡ a 3 de 3.

### 04 Â· Meus emprÃ©stimos (1440Ã—820)
Sidebar + header com breadcrumb simples e botÃ£o "Pegar emprestado".
ConteÃºdo: cabeÃ§alho "Comigo agora" + "2 de 3 itens Â· nenhum em atraso" com segmentos de limite (180px) Ã  direita â†’ duas linhas de emprÃ©stimo (Ã­cone 44px | nome + meta | prazo com barra | botÃ£o "Devolver") â†’ rÃ©gua esmaecida â†’ tabela **HistÃ³rico** (Item / Retirada / DevoluÃ§Ã£o / SituaÃ§Ã£o) com "No prazo" verde e atraso em Ã¢mbar.

### 05 Â· OperaÃ§Ãµes â€” emprÃ©stimos em aberto (1440Ã—900)
Sidebar (usuÃ¡rio = "OperaÃ§Ãµes Â· BalcÃ£o Â· 2Âº andar") + header com busca ampliada e "Cadastrar equipamento".
ConteÃºdo: H1 + "21 itens fora Â· atualizado agora" â†’ 4 cards de estatÃ­stica (Em aberto 21 Â· Vencem em 3 dias 4 Â· **Em atraso 3** com borda e nÃºmeros em vermelho Â· Em manutenÃ§Ã£o 2) â†’ chips (Todos / Em atraso / Vencem esta semana / Notebooks) â†’ tabela de 7 linhas com botÃ£o "Devolver" por linha, linhas em atraso tingidas e com botÃ£o reforÃ§ado â†’ paginaÃ§Ã£o "7 de 21 emprÃ©stimos" + Anterior/PrÃ³ximo.

### 06 Â· OperaÃ§Ãµes â€” cadastrar equipamento (1440Ã—820)
Sidebar + header com breadcrumb (OperaÃ§Ãµes â€º Cadastrar equipamento).
ConteÃºdo `1fr 320px`:
- FormulÃ¡rio (mÃ¡x. 620px): H1 + nota "Um registro por unidade fÃ­sica" â†’ Nome (largo) Â· Categoria Â· PatrimÃ´nio Â· NÃºmero de sÃ©rie Â· Local de retirada Â· **SituaÃ§Ã£o inicial** (segmentado: DisponÃ­vel / Em manutenÃ§Ã£o / Fora de uso + nota "Em manutenÃ§Ã£o nÃ£o aparece no catÃ¡logo") Â· ObservaÃ§Ãµes (textarea) â†’ aÃ§Ãµes "Cadastrar" (primÃ¡rio) e "Cadastrar e adicionar outro" (secundÃ¡rio).
- Coluna lateral: **PrÃ©via no catÃ¡logo** (card real renderizado com os dados do formulÃ¡rio) e **Ãšltimos cadastros** (3 linhas item/data).

---

## 7. NavegaÃ§Ã£o

- **Sidebar fixa de 236px**, presente em todas as telas do app (nÃ£o no login), dividida em dois grupos rotulados: **Colaborador** (CatÃ¡logo, Meus emprÃ©stimos) e **OperaÃ§Ãµes** (EmprÃ©stimos em aberto, Cadastrar equipamento). OperaÃ§Ãµes Ã© seÃ§Ã£o extra no mesmo app, nÃ£o app separado.
- **Item ativo**: fundo `#0E1530`, texto `#E6EAF6`, Ã­cone Phosphor *fill* em `#8AA6EE` e barra de 2px Ã  esquerda via `box-shadow: inset 2px 0 0 #5B7FE0`.
- **Item inativo**: texto `#9AA3BC`, Ã­cone regular; hover `background:#0B1128; color:#E6EAF6`.
- **Badge de contagem** em "Meus emprÃ©stimos": pill `padding:1px 7px`, fundo `#132663`, texto `#B4C6F6` 11px, `margin-left:auto`.
- **Breadcrumb** no header das telas de profundidade 2 (03 e 06): links em `#8AA6EE`, separador `ph-caret-right` 12px, item atual em `#E6EAF6`.
- Fluxos: CatÃ¡logo â†’ card disponÃ­vel â†’ Detalhe â†’ diÃ¡logo de confirmaÃ§Ã£o â†’ Meus emprÃ©stimos. Meus emprÃ©stimos â†’ "Pegar emprestado" â†’ CatÃ¡logo. OperaÃ§Ãµes â†’ "Cadastrar equipamento" â†’ tela 06.
- O contador "2 de 3 itens com vocÃª" aparece no header do CatÃ¡logo e do Detalhe.
- Neste layout as telas sÃ£o estÃ¡ticas e ligadas por Ã¢ncoras (`#s1`â€¦`#s6`); em implementaÃ§Ã£o real, rotas: `/login`, `/catalogo`, `/catalogo/:patrimonio`, `/meus-emprestimos`, `/operacoes/emprestimos`, `/operacoes/equipamentos/novo`.

---

## 8. AnimaÃ§Ãµes e transiÃ§Ãµes

Movimento Ã© discreto e funcional; nada decorativo, nada que se mova sozinho.

| Elemento | Propriedade | DuraÃ§Ã£o / curva |
|---|---|---|
| Hover de item de navegaÃ§Ã£o | `background, color` | 120ms `ease-out` |
| Hover de botÃ£o | `background, border-color, color` | 140ms `ease-out` |
| Hover de card do catÃ¡logo | `border-color` | 160ms `ease-out` |
| Pressionado (botÃµes) | `transform: translateY(1px)` | 80ms |
| Abertura de diÃ¡logo | `opacity 0â†’1` + `translateY(6px)â†’0`, backdrop `opacity 0â†’1` | 180ms `cubic-bezier(.2,.8,.2,1)` |
| Fechamento de diÃ¡logo | inverso | 120ms `ease-in` |
| Barra de prazo / segmentos ao mudar | `width` / `background` | 240ms `ease-out` |
| RemoÃ§Ã£o de linha apÃ³s devoluÃ§Ã£o | `opacity 1â†’0` + `heightâ†’0` | 200ms `ease-in` |
| Foco de teclado | sem transiÃ§Ã£o (ring imediato) | â€” |

Regras: nunca animar `box-shadow` de moldura; nada acima de 240ms; respeitar `@media (prefers-reduced-motion: reduce)` desativando transform e opacity em favor de troca imediata.

---

## 9. Regras de negÃ³cio visÃ­veis na interface

1. **MÃ¡ximo de 3 itens por pessoa** â€” contador no header ("2 de 3 itens com vocÃª"), segmentos de limite no detalhe e em Meus emprÃ©stimos, aviso no diÃ¡logo quando a solicitaÃ§Ã£o leva ao terceiro item.
2. **Prazo padrÃ£o de 14 dias** â€” data calculada no card de solicitaÃ§Ã£o ("Devolver atÃ© 14/set"), barra de progresso por item, coluna "Prazo" em OperaÃ§Ãµes.
3. **Atraso bloqueia novo emprÃ©stimo** â€” linha tingida em vermelho suave, card de estatÃ­stica "Em atraso" com borda vermelha, botÃ£o "Solicitar" desabilitado (`opacity:.45`) com nota explicativa quando houver atraso.
4. **ManutenÃ§Ã£o nÃ£o fica disponÃ­vel** â€” pill Ã¢mbar, card sem aÃ§Ã£o, e nota no controle "SituaÃ§Ã£o inicial" do cadastro.
5. Fora de escopo v1 (nÃ£o desenhar): reserva com data futura, notificaÃ§Ã£o por e-mail, importaÃ§Ã£o de planilha.

---

## 10. Notas de implementaÃ§Ã£o

- Estilos **inline** no template do componente; o Ãºnico CSS global permitido Ã© `@font-face`/import de fonte, `@keyframes` e resets de `body`.
- Fontes: `https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700`.
- Ãcones: `https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css` e `.../fill/style.css`.
- Design system Nocturne carregado a partir de `_ds/nocturne-<id>/styles.css` + `_ds_bundle.js`; as variÃ¡veis de tema sÃ£o sobrescritas no `:root` com a paleta desta especificaÃ§Ã£o.
- Layout com `flex`/`grid` + `gap` em todos os grupos de irmÃ£os; nunca espaÃ§ar por margem individual ou whitespace.
- Cada tela recebe `data-screen-label` ("01 Login" â€¦ "06 Cadastrar equipamento") para referÃªncia.
- ConteÃºdo de exemplo: Marina Alves (Design, 2 itens), Rafael Lima (Eng), Camila Duarte (Mkt, atrasada), Tiago Menezes (Suporte, atrasado), Ana Sato (Financeiro), Bruno Kato (Eng), Helena Prado (Comercial, atrasada). Equipamentos: MacBook Pro 14" PAT-1042, ThinkPad T14 PAT-1188/1190, Dell UltraSharp 27" PAT-0871, LG UltraFine 24" PAT-0910, Sony A7 III PAT-0233, Dock USB-C Anker PAT-0455, Adaptador HDMI Belkin PAT-0338, Projetor Epson X49 PAT-0102, MacBook Air 13" M2 PAT-1204.
- Tom de copy: **seco e operacional** â€” frases curtas, sem exclamaÃ§Ã£o, sem emoji, sem "ops!". Datas no formato `dd/mmm` (`14/set`).
- Idioma: portuguÃªs do Brasil.