# Plano dos dados iniciais

O ADR-001 define Prisma Migrate como dono do schema e pede um seed
idempotente em `prisma/seed.ts`. Usar os modelos existentes de tenant,
categoria, equipamento e vínculo. O Supabase Auth continua responsável pela
conta. O seed recebe seu UUID e valida a existência antes de gravar.

Serializar execuções do seed com um lock transacional. Criar apenas registros
ausentes. Retornar divergências de metadados e a contagem de empréstimos
docentes. A identidade docente deve permanecer separada das contas de teste.

Preparar o manifesto de imagens à parte. Os metadados são unidos pelo
patrimônio e o Storage usa os nomes estáveis definidos na spec.
