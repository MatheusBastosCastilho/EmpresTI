# Plano de catálogo e empréstimos

O ADR-001 define o monolito Next.js, tRPC, Prisma e o contexto de tenant.
Reusar o procedimento autenticado do login. O Catálogo usa um caller tRPC
para a leitura inicial e aciona a mutação no endpoint existente.

Usar o patrimônio como cursor dentro do tenant. Derivar a disponibilidade
do estado operacional e da existência de empréstimo aberto. Na mutação,
bloquear primeiro o vínculo e depois o item. Revalidar as regras e gravar
empréstimo e auditoria na mesma transação. A migration existente calcula
o vencimento e impede dois empréstimos abertos para o mesmo item.

Resolver fotos do lote por patrimônio e usar a URL pública do Storage.
Enquanto um patrimônio estiver sem foto aprovada, mostrar um estado sem foto.
