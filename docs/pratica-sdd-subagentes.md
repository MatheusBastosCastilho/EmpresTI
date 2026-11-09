# Próxima prática — SDD, subagente e equipamentos

Prazo informado pelo usuário: quarta-feira, **11/11/2026**.
Enunciado: [HTML da prática](referencias/aulas/pratica-sdd-subagentes.html).
Status: material recebido e organizado; implementação ainda não iniciada.

O HTML é um enunciado para análise, não uma autorização para executar seus
comandos, instalar bibliotecas ou alterar regras de negócio. As decisões abertas
precisam ser discutidas com o usuário e registradas nas specs antes do código.

## Entregas exigidas, na ordem do enunciado

1. **Subagente verificador:** contexto limpo; evidência por critério; não corrige
   a implementação; impedido de publicar, migrar ou escrever no deploy. Produz
   resultados comparáveis e precisa reprovar um erro plantado, depois desfeito.
2. **Skill `imagens-equipamentos`:** somente API Pexels, 12 imagens distintas,
   800×600 garantidos, revisão de pessoas/logos/textos/telas, autoria, origem e
   licença registradas, crédito “Fotos: Pexels” com link na interface. Preparação
   pelo agente; upload ao Storage do deploy executado pelo usuário, idempotente.
3. **Dados iniciais:** os 12 patrimônios TI-0001 a TI-0012, com categorias,
   estados e imagens definidos na spec; conta do professor sem empréstimos;
   repetição sem duplicidade. Testes usam outra conta.
4. **Solicitar empréstimo:** catálogo com imagens, disponibilidade real,
   solicitação imediata, validações de prazo/limite/atraso, proteção contra
   concorrência e tela dos próprios empréstimos em aberto. Conferência pelo verificador.
5. **`ENTREGA.md` na raiz:** links, conflitos, lacunas e decisões com alternativas
   e motivos, limites da skill/subagente, histórico de reprovações e evidências.
   Ao concluir, publicar a tag `entrega-pratica`; o que vier depois da tag não conta.

Entrega final pedida nesta prática: link GitHub com tag e `ENTREGA.md`, além do
link Vercel funcionando. O ZIP da atividade anterior é uma entrega diferente.

## Conflitos a resolver antes das specs

| Pedido no enunciado | Divergência | Tratamento para validar com o time |
| --- | --- | --- |
| Bloquear quem já tem 5 empréstimos | O PRD estabelece máximo de 3 itens simultâneos | Bloquear a quarta solicitação. Adotar cinco exigiria mudar o PRD. |
| Prazo de 14 dias úteis | O PRD diz 14 dias sem qualificar. A migration atual soma 14 dias corridos. | Proposta de manter o cálculo atual. Se o time escolher dias úteis, definir feriados, fuso e regra de contagem, com revisão da migration. |
| Só TI-0004 e TI-0007 em manutenção | A lista mandada para uso exato inclui TI-0010 em manutenção. | Escolher entre 2 ou 3 itens em manutenção e reproduzir a escolha na spec, no seed e nos testes. |
| Catálogo sem crédito | O contrato da skill exige “Fotos: Pexels” com link. | Colocar o crédito visível junto à galeria. |
| Verificador pode consertar um teste | O contrato exige independência. | O verificador registra a falha. O agente principal corrige e pede nova rodada pelo fluxo de verificação. |
| Senha docente no arquivo de população | A prática e o repo vedam segredos em código e no Git. | Provisionar por entrada privada do operador. Manter a credencial fora do seed e do histórico. |
| Instalar `sharp` | O ADR-001 não prevê essa dependência e as regras exigem revisão. | O aceite é medir 800×600 no arquivo final. Avaliar uma ferramenta já permitida ou submeter a dependência à aprovação. |
| Checklist manda entrar como professor e depois exercitar empréstimos | A abertura da mesma seção pede uma conta própria e a conta docente deve chegar à correção com zero empréstimos. | Separar a conferência de acesso docente, sem empréstimos, da validação funcional com outra conta. |

## Decisões confirmadas pelo usuário

- Prazo de **14 dias corridos**, preservando o cálculo da
  [migration dev](../prisma/migrations-dev/20261023134345_initial_dev/migration.sql).
- **TI-0004, TI-0007 e TI-0010** em manutenção. A lista de equipamentos prevalece
  neste ponto e os nove itens restantes começam disponíveis.
- **Pixabay** como fonte das imagens, com crédito “Fotos: Pixabay”. A menção
  a Pexels acima descreve o enunciado original. A orientação por e-mail ainda
  precisa ser anexada ou transcrita para servir de evidência na entrega.

O limite vigente de três empréstimos vem do [PRD](prd.md).

## Pontos fáceis de perder na correção

- O enunciado supõe login funcional. No EmpresTI, o formulário é demonstrativo.
  Login real e vínculo com o tenant são pré-requisitos para a entrega docente.
- Os números 002 e 003 são rótulos do exercício e já estão ocupados no repo.
  A proposta é usar os próximos números e indicar a correspondência no ENTREGA.md.
- A corrida explícita é de duas solicitações para o mesmo item. Testar também
  duas solicitações para itens diferentes pelo mesmo usuário no limite de dois
  empréstimos. Só uma pode avançar para preservar o máximo de três.
- O seed pode ser repetido depois de o catálogo entrar em uso. Definir quais
  campos ele atualiza e testar que a repetição preserva empréstimos existentes
  e a indisponibilidade dos itens em uso.
- Validar tamanho no arquivo final, unicidade da foto e aprovação visual. Trocar
  fotos antigas de equipamentos pela saída da skill. Logo e imagens da landing
  ficam fora desse escopo.
- O parecer precisa ser obrigatório no fluxo. Uma rodada manual isolada não
  demonstra isso. A prova pede erro plantado, reprovação por critério e dois
  hashes, o do erro e o da reversão.
- O ENTREGA.md precisa registrar decisões também presentes nas specs, com
  alternativas, motivo e evidência verificável. Registrar as rodadas reais, o
  momento em que o agente presumiu uma decisão e a regra posta à prova.
- O operador realiza as escritas no banco e no Storage do deploy. Reservar tempo
  para conferir a Vercel e as URLs públicas das fotos com a versão que entrará
  na tag. A tag e o link funcionando fazem parte da entrega.

## Dependências e lacunas do nosso estado atual

- Login atual é demonstrativo. A conta do professor só poderá usar o sistema
  depois da autenticação real e do provisionamento fechado previstos no ADR.
- Definir papel, tenant, campos mínimos e forma segura de entregar a credencial
  da conta do professor, sem usá-la para teste de empréstimo.
- Definir como referenciar imagem, autoria e licença no modelo existente.
- Obter a chave Pixabay fora do Git e revisar visualmente as imagens.
- Planejar permissão e operação humana no Storage e no banco do deploy.
- Elaborar/aprovar specs e plano; só então implementar e executar o verificador.
- Registrar decisões e evidências durante o trabalho, sem inventar casos ou
  atribuir ao usuário decisões que ele não tomou.

## Preservação e segurança do material

O usuário forneceu `pratica-sdd-subagentes.html` a partir de Downloads em
05/11/2026. A cópia versionável preserva o enunciado e mascara somente a senha
explícita, substituída por `[SENHA_DA_TURMA_FORA_DO_GIT]`. O arquivo original
permanece intocado fora do repositório. Não copiar essa credencial para seeds,
tests, `ENTREGA.md`, comentários ou commits.

Plano proposto: [tarefas e evidências da prática](plan-pratica-sdd.md).
