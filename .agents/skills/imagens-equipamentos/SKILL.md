---
name: imagens-equipamentos
description: Prepare, revise e catalogue fotos de equipamentos do EmpresTI pela API Pixabay para o catálogo da prática SDD.
---

Use somente resultados da API Pixabay e mantenha a chave no ambiente local do
operador. Siga [o fluxo de seleção e entrega](references/fluxo.md).

1. Busque candidatos com o script e inspecione visualmente cada candidato.
2. Rejeite fotos com pessoas, marcas ou logos legíveis, texto, telas com conteúdo
   ou objeto incompatível. Registre o ID e o motivo de cada rejeição.
3. Prepare um lote de 12 IDs distintos. Inspecione novamente os JPEGs finais
   e registre a aprovação visual antes de disponibilizar o lote ao operador.
4. Entregue os arquivos e o manifesto ao operador para upload no bucket
   público. A skill prepara arquivos locais e não recebe acesso ao Supabase.
5. Ao integrar o catálogo, use o manifesto para a origem e a autoria. Exiba
   “Fotos: Pixabay” com link para https://pixabay.com/.
