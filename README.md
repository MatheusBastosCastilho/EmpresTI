# EmpresTI

## Entrega atual: tela de login

[Abrir tela publicada](https://empres-ti-beryl.vercel.app/login)

A rota `/login` apresenta o login do EmpresTI conforme o layout Nocturne.
A rota `/` redireciona para ela. O formulário valida os campos localmente e
permite mostrar ou ocultar a senha. O envio informa que o acesso ainda não está
habilitado: esta entrega não autentica nem persiste credenciais. Use dados
fictícios para testar.

Requer Node.js 24 e as dependências já registradas no lockfile:

```bash
npm ci
npm run dev
```

Verificação:

```bash
npm test
npm run lint
npm run build
```

Essa tela não precisa de banco nem de variáveis de ambiente. Não executar
migrations como parte do build ou da publicação desta entrega. A versão atual segue a referência
desktop; a adaptação completa para celular e tablet permanece fora deste recorte.

## Publicação

A tela foi publicada em 23/10/2026 no projeto `empres-ti`, do workspace
`matbastoscastilho-8909`, com upload dos arquivos locais pelo Vercel Drop.
O build remoto e o formulário demonstrativo foram verificados no navegador.
Esta publicação não criou commits, pushes nem vínculo com o repositório GitHub.

Para futuras publicações pelo computador, com acesso ao mesmo workspace:

Com Node.js 24 instalado, abra o terminal na pasta que contém `package.json`:

```bash
npx --yes vercel@64.5.0 deploy --prod --scope team_OCnV1YafHp7PK0LRDpbxGvXi
```

Conclua a autenticação solicitada pela CLI e selecione o projeto `empres-ti`.
Mantenha o framework Next.js e o comando de build `npm run build`.
Ao terminar, a CLI exibirá o endereço publicado.

Esse comando envia os arquivos locais diretamente e não exige commit ou push.
Não é necessário configurar banco, executar migrations ou adicionar segredos
para publicar somente esta tela de demonstração.
