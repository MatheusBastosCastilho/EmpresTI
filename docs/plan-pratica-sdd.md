# Plano da prática SDD

Entrega prevista para quarta-feira, 11/11/2026. Execução iniciada pela SDD-01.
Ver o [enunciado e seus conflitos](pratica-sdd-subagentes.md).

| Tarefa | Trabalho | Evidência de conclusão |
| --- | --- | --- |
| SDD-01 | Configurar no harness um verificador independente, com contexto limpo, somente leitura, sem rede nem credenciais de deploy. Propor uma verificação obrigatória que vincule o parecer à versão da spec e à revisão de código. | Parecer por critério com resultado e evidência. Bloqueio sem parecer, com parecer desatualizado ou com reprovação. Prova de erro plantado e reversão registrada em SDD-06. |
| SDD-02 | Criar a skill de imagens com API Pixabay, revisão visual e manifesto, depois de definir o método de redimensionamento. | 12 fotos distintas aprovadas com 800×600, origem, autor e licença. Repetição mantém os mesmos destinos. |
| SDD-03 | Refinar e implementar a spec de login real com Supabase Auth e contexto tRPC, após revisar permissões, dependências e política de sessão. | Login, logout, proteção de rotas e isolamento entre tenants validados localmente. |
| SDD-04 | Especificar e preparar o seed local com 12 equipamentos, referências de imagem, usuário docente e conta de teste separada. | Segunda execução sem duplicatas, 12 patrimônios e zero empréstimos para a conta docente. Procedimento humano de banco e Storage documentado. |
| SDD-05 | Especificar e implementar catálogo autenticado, solicitação imediata e empréstimos próprios em aberto. | Testes PostgreSQL para concorrência pelo item, limite por colaborador, atrasos, manutenção e isolamento. Fluxo pelo navegador com a conta de teste. |
| SDD-06 | Rodar o verificador, registrar falhas e correções, plantar e reverter um erro isolado. Preparar o ENTREGA.md, validar a versão publicada e registrar tag e links. | Duas rodadas comparáveis, reprovação do erro plantado, reversão comprovada e parecer final. Link Vercel verificado após a publicação pelo responsável. |

SDD-01 pode começar antes de fechar as regras de empréstimo. SDD-02 e SDD-03
podem ser preparadas de forma independente. SDD-04 depende das fotos e da
definição de acesso, e SDD-05 depende do login e da massa de teste. Rodar lint,
testes e build nas tarefas de código. Não avançar com check vermelho.

## Decisões para as próximas tarefas

- Manter três itens conforme o PRD. O usuário confirmou 14 dias corridos e
  TI-0010 em manutenção junto com TI-0004 e TI-0007.
- Propor crédito Pixabay visível junto ao catálogo, parecer sem edição de testes,
  credencial docente fora do Git e novos números após a spec 003.
- Definir o método de redimensionamento antes de aprovar dependências. A chave
  Pixabay fica com o operador e fora do repositório.
- Fechar as questões de login do rascunho 003 e definir membership da conta
  docente antes do seed. Se houver mudança de banco, submeter o DDL à revisão.
- Confirmar com o responsável o ambiente da demonstração e reservar tempo
  para suas operações de publicação, banco e Storage, seguidas da conferência.

A aprovação do plano e a autorização de cada tarefa seguem as regras do
repositório. Commit, push, tag e publicação seguem a autorização aplicável a
esta prática.

## SDD-01 — Como verificar

O fechamento da spec usa `node scripts/verify-spec.mjs docs/specs/NNN-nome/spec.md`.
O comando lê a spec e o diff da revisão registrada no Git. Por padrão a base
é o ancestral comum com `origin/main`. Use o segundo argumento para repetir
uma rodada histórica. O resultado JSON identifica a base, a revisão e a
evidência por critério, em ordem estável. Um erro, parecer incompleto ou critério
sem aprovação devolve código 1. O verificador é acionado pelo próprio comando
de fechamento. Essa exigência é local ao fluxo SDD, sem proteção de merge no GitHub.

O perfil em `.codex/agents/spec_verifier.toml` define o papel no harness.
O comando usa as mesmas instruções numa sessão nova e efêmera do Codex, com
sandbox de leitura, sem shell, busca, apps, plugins ou MCP configurado. A
sessão recebe apenas a spec e o diff de caminhos de implementação da revisão,
sem arquivos de ambiente ou histórico da conversa. O operador roda os testes
separadamente. A sessão não tem acesso aos arquivos fora da evidência enviada.

Na primeira rodada, a spec de login rascunhada em `8dc5782`, comparada à base
`28b8610`, retornou seis critérios sem evidência e código 1. Isso é um teste do
bloqueio por falta de implementação. A prova com defeito plantado, reversão e
pareceres finais pertence à SDD-06.

## SDD-02 — Preparação de imagens

A [skill de imagens](../.agents/skills/imagens-equipamentos/SKILL.md) usa
PowerShell 7 e o System.Drawing do Windows para recortar proporcionalmente e
validar 800×600 no JPEG salvo. O script consulta a API Pixabay e gera o manifesto
de autoria, licença, destino e hash. A revisão de conteúdo visual permanece
manual e o upload ao Storage cabe ao operador.

O teste com API simulada confirmou busca dos 12 patrimônios, geração dos
JPEGs, estabilidade do manifesto na repetição e rejeição de IDs duplicados.
A primeira rodada ao vivo retornou 15 candidatos por patrimônio e produziu um
lote preliminar de 12 JPEGs. Na revisão dos recortes, os IDs 791032 (notebook),
6801339 (notebook) e 1494790 (cabo de rede) passaram no filtro visual.
Os demais foram separados para substituição.

| ID | Motivo da rejeição no lote preliminar |
| --- | --- |
| 2982270 | Marca legível na câmera ao lado do notebook |
| 593327 | Texto legível na caneta |
| 1868496 | Logo no monitor |
| 2568755 | Logo no monitor e texto no calendário |
| 1207834 | Logo no monitor |
| 2202226 | Inscrição legível no conector |
| 4498743 | Três padrões de conector na mesma foto, sem destacar um único USB-C |
| 1219748 | Texto legível no anel da lente da webcam |
| 1362419 | Marca e modelo legíveis na câmera |

Na segunda rodada, passaram mais quatro recortes: 3036166 (TI-0001),
17894 (TI-0005), 17768 (TI-0006) e 1827 (TI-0008). A revisão acumulada
tem sete patrimônios aprovados. Ainda faltam TI-0004, TI-0007, TI-0009,
TI-0011 e TI-0012.

| ID | Motivo da rejeição no segundo lote |
| --- | --- |
| 1734485 | Logo na tampa do notebook |
| 2853844 | Logo na frente do monitor |
| 319839 | Marca legível no cabo |
| 796227 | Texto legível no anel da lente da webcam |
| 2757546 | Marca legível na câmera e na tampa |

Em 09/11, a revisão aprovou mais três recortes: 1840050 (TI-0004),
2593899 (TI-0007) e 4498745 (TI-0009). Com isso, dez patrimônios têm
fotos aprovadas. Faltam a webcam TI-0011 e a câmera compacta TI-0012.

| ID | Motivo da rejeição nas rodadas de 09/11 |
| --- | --- |
| 3109537 | Marca no monitor e conteúdo visível na tela |
| 8670926 | O tipo de câmera não fica claro como webcam |
| 551287 | Texto legível nos botões da câmera |
| 5095868 | Inscrição 720p na webcam, incompatível com o item Full HD |
| 4907226 | Texto legível nos controles da câmera |
| 4607652 | Webcam Full HD com a inscrição “HD 1080p” legível |
| 1989582 | Câmera compacta com marca e inscrições legíveis |
| 3545828 | Marca e especificações legíveis no corpo da câmera |

Onze JPEGs aprovados tiveram dimensões, IDs únicos e hashes conferidos.
A foto 1163880 representa a webcam com uma câmera de videoconferência.
A imagem é ilustrativa e não comprova a resolução física do equipamento.
A câmera compacta TI-0012 foi aprovada com o ID 931821. A foto representa
uma câmera de ação compacta e passou no filtro estrito no JPEG final.
Os IDs 600643, 1742875,
8246764, 819359, 600645, 1925655 e 1933648 foram descartados por inscrições
ou marcas legíveis. Também foram rejeitados 6917211, 5416890, 4397018, 630232,
1064233, 933663, 5963588 e 683314 por marcas, modelo ou conteúdo em tela.
O manifesto final está em `data/equipment-photos.json`. Dimensões, IDs e
hashes dos 12 JPEGs foram conferidos no pacote do operador.

O usuário confirmou manter o filtro estrito em 09/11/2026. Inscrições legíveis
continuam sendo motivo de rejeição, inclusive nas duas fotos pendentes.

## SDD-03 — Login

Escopo funcional confirmado na [spec 003](specs/003-login-real/spec.md).
O plano técnico segue o ADR-001. Primeiro, integrar Supabase Auth ao servidor,
com cookie httpOnly e renovação nas rotas protegidas. Depois, resolver usuário
e membership no contexto tRPC e proteger a entrada do Catálogo. Por fim,
validar login, logout, falhas de autenticação e isolamento com conta de teste.

Foram aprovadas as dependências `@supabase/supabase-js`, `@supabase/ssr`,
`@trpc/server` e `superjson`. O [DDL proposto](specs/003-login-real/ddl-proposto.sql)
cria uma tabela privada em `dev`, sem dados preexistentes. A aplicação
armazenará chaves HMAC para conta e IP, sem guardar identificadores em claro.
Dentro de uma transação, bloquear as duas chaves em ordem estável, contar
eventos da janela e reservar a tentativa. Após sucesso, remover a reserva
pelo ID. Falhas e interrupções preservam a reserva até expirar. A limpeza
remove eventos expirados usando o índice de tempo.

A migration `20261109121152_login_attempts` foi aplicada no Supabase local
e reproduzida do zero em PostgreSQL descartável com Prisma Migrate. O smoke
confirma RLS, a política restritiva, a ausência de privilégios dos papéis da
API e a rejeição de chaves com comprimento inválido. Os sete testes passaram.

A rodada HTTP local da implementação comprovou LOGIN-01 a LOGIN-06. Duas
contas descartáveis permitiram conferir credenciais inválidas, rejeição de
conta sem vínculo, cookie httpOnly, Catálogo autenticado, rejeição de
`tenantId` enviado pelo cliente e logout. O cadastro público permaneceu
bloqueado e as contas de teste foram removidas. O parecer formal depende
da revisão candidata registrada no Git.

LOGIN-07 foi validado com renovação real no Supabase local. O token renovado
teve um novo horário de emissão e preservou o horário da autenticação por
senha. LOGIN-08 foi validado em PostgreSQL descartável com seis solicitações
concorrentes para a mesma conta, vinte reservas para o mesmo IP e expiração.

## SDD-05 — Catálogo e empréstimos

A suíte passou com 12 testes, incluindo as duas corridas descritas em CA-05.
A rodada HTTP usou o build Next.js, o Auth local e PostgreSQL descartável.
Confirmou 401 sem sessão, os 12 itens do seed, criação de empréstimo,
vencimento, 409 ao pedir o mesmo item e a lista pessoal. A leitura das URLs
do Storage do deploy depende do upload pelo operador. No Storage local,
as 12 URLs responderam sem autenticação com HTTP 200, MIME JPEG e SHA-256
igual ao manifesto.
