# Verificação da colaboração

## Executado
- `npm run check`: TypeScript aprovado.
- `npm run build`: build Vite aprovado.
- `npm test`: 13 testes aprovados, incluindo os dez testes existentes.
- `node --check server/app.js`: sintaxe aprovada.
- Migração de banco antigo testada: convites preservados e perfil padrão viewer; segunda inicialização idempotente.
- Contribuinte: gravação no quadro do titular, print pertencente ao titular, identidade do autor/registro protegida contra falsificação, candidatura/etapa editável.
- Restrições: visualizador sem escrita; contribuinte sem gestão de plataformas/currículos, PDF ou arquivamento; apenas titular altera perfil.
- Downgrade e revogação bloqueiam novas operações do mesmo usuário/sessão e não apagam as vagas/prints já contribuídos.
- Controle de envio registra titular/contribuinte, data e ator; desmarcação preserva histórico.

## Limites da verificação
- Sem validação visual desta alteração. Na sessão anterior, o controle do navegador foi bloqueado por não conseguir identificar com segurança a URL no Windows.
- Auditoria estática premium tentada novamente, mas Python não executa neste ambiente (`python.exe`: acesso ao arquivo indisponível). Não foi declarado sucesso dessa auditoria.
- Google, Resend e OpenAI reais seguem sem teste de ponta a ponta, pois dependem de credenciais da instalação. Os testes não enviam e-mails nem consomem IA.

## Foto e SPA
- npm run check e npm run build: aprovados.
- npm test: 15 testes aprovados. Cobertura adicional de URLs de fotos, resposta autorizada de perfil/workspace, autoria e migração de usuários existentes sem perda do nome.
- Navegação SPA usa History API e escuta popstate; menu recebe aria-current e conteúdo tem atalho de acesso. Verificação de interação no navegador ainda pendente devido ao acesso de UI indisponível nesta sessão.
- Foto Google real requer login configurado. Fallback com iniciais também atende contas antigas e falha de imagem.

## Publicação inicial
Build normal e build:pages aprovados; 16 testes passaram. Demonstração estática exercitada em teste sem backend. Arquivos do commit conferidos: sem .env real, SQLite, uploads ou builds. Publicação manual (workflow_dispatch) e regra de futuras mudanças locais registrada em AGENTS.md. Localhost respondeu HTTP 200.
