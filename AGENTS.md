# Regras deste projeto

O usuário autorizou a publicação inicial no GitHub e GitHub Pages.

Após essa publicação, trabalhar **localmente por padrão**. Não fazer push, publicar no Pages, executar o workflow de deploy ou alterar a versão online sem um novo pedido explícito do usuário. Commits locais não são autorização de publicação.

Prévia de desenvolvimento: `npm run dev`, http://localhost:3000.
GitHub Pages é somente uma demonstração estática, com dados fictícios e alterações temporárias em memória. O app real usa o servidor Node e banco local.

Nunca versionar `.env`, dados SQLite, credenciais, arquivos pessoais enviados ou builds. O workflow Pages usa somente `workflow_dispatch`, sem gatilho de push.
