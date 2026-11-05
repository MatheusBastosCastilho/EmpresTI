# Referências externas — EmpresTI de Gabriel

Fonte: https://github.com/GabrielMartinsss26/EmpresTI

Commit consultado: `848eff98cf81536557fdc44d33b81021ce06bdba`

Consulta: 23/10/2026.

Material incorporado como referência a pedido do usuário. Os documentos deste
diretório não substituem o PRD, os ADRs, as specs nem as regras deste projeto.
Os arquivos originais foram preservados; instruções e estados de execução neles
descritos pertencem ao projeto de origem.

## O que foi aproveitado

- `aulas/aula7-sdd-conceito.html`: material do professor sobre requisitos,
  decisões técnicas, specs e dúvidas que precisam de resposta antes do código.
- `aulas/aula8-greenfield-ordem.html`: sequência dos artefatos e critérios
  AZ-01 a AZ-08 para provar a integração das camadas.
- `producao-original.md`: referência de configuração, validação e integração
  de serviços; seus comandos não estão autorizados automaticamente aqui.
- `modelo-de-dados-original.md`: comparação do domínio, sem adoção do modelo.

## Diferenças que impedem copiar a implementação diretamente

| Tema | Nosso projeto | Referência de Gabriel |
| --- | --- | --- |
| Empréstimo | Confirmação cria empréstimo imediato | Operações aprova solicitação |
| Devolução | Colaborador ou Operações registra | Colaborador solicita; Operações confirma |
| Papéis | COLLABORATOR e OPERATIONS | Inclui ADMIN |
| Usuário | Nome e departamento na membership | Perfil separado |
| Equipamento retirado de uso | RETIRED | OUT_OF_SERVICE |
| Interface | ADR-002 e login já publicado | Implementação visual própria |

A spec local `docs/specs/002-modelo-dados/spec.md` prevalece sobre essas
alternativas. Não importar migrations, seed, schema ou routers de Gabriel sem
adaptar e revisar as diferenças. Nenhuma credencial ou configuração de conta
do projeto de origem deve ser reutilizada.

## Aproveitamento posterior de código

O repositório de origem contém implementação de autenticação, contexto tRPC,
validação de ambiente, health check e testes de banco. São referências para
revisão técnica; nenhum desses arquivos de aplicação foi importado nesta etapa.
Verificar compatibilidade com a nossa stack, regras e versões antes de adotar.

## Lacunas evidenciadas pelas aulas

- AZ-01: ainda não há comando único comprovado para subir aplicação e banco.
- AZ-02: a aplicação atual não acessa o banco.
- AZ-03: migration versionada existe; aplicação local ainda não verificada nesta máquina.
- AZ-04: endpoint de saúde com consulta ao banco ainda não existe.
- AZ-05: página exibindo o resultado do endpoint ainda não existe.
- AZ-06: testes de componentes existem; teste do endpoint ainda não existe.
- AZ-07: `.env.example` existe; validação de configuração no boot ainda falta.
- AZ-08: `.env*` reais são ignorados; exemplo está sem valores.

Não é necessário apagar o domínio existente para verificar esses critérios.
