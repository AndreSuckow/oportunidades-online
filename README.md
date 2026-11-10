# Oportunidades Online

Aplicação full stack para acompanhar vagas: React + TypeScript + Vite, API Express e SQLite persistente (Node 24). Login Google com OAuth/OIDC, convites de visualização ou contribuição por e-mail e extração de anúncios com OpenAI.

## Rodar no seu computador

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Abra http://localhost:3000. `ALLOW_DEMO=true` permite explorar com dados fictícios, somente via loopback e fora de produção. Cada entrada na demonstração cria um novo espaço de teste. Dados salvos permanecem no banco, mas não há recuperação da conta de demonstração após sair. Não use dados pessoais na demonstração.

## Configurar as integrações

As chaves devem ficar no `.env` local ou no gerenciador de segredos da hospedagem. Não envie segredos pelo chat e não os adicione ao Git.

### Google

1. Crie um projeto no Google Cloud e configure a tela de consentimento para OpenID, e-mail e perfil.
2. Crie cliente OAuth do tipo aplicativo Web.
3. Cadastre `http://localhost:3000/auth/google/callback` como URI de redirecionamento. Para produção, cadastre também `https://SEU-DOMINIO/auth/google/callback`.
4. Preencha `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`. Configure usuários de teste enquanto o app estiver em teste.
5. Use o mesmo endereço de `APP_URL` para acessar a aplicação. Em produção, `APP_URL` deve ser HTTPS.

O servidor usa state vinculado ao cookie, PKCE, nonce, validação de assinatura/audience/issuer do ID token pela biblioteca oficial Google, sessões opacas com hash no banco e cookies HttpOnly/SameSite. A identidade é o `sub` do Google. O serviço não acessa e-mails nem contatos do usuário.

Documentação: https://developers.google.com/identity/openid-connect/openid-connect

### Convites por e-mail

Crie uma chave de API no Resend, verifique um domínio remetente e preencha `RESEND_API_KEY` e `EMAIL_FROM` (ex.: `Oportunidades Online <convites@seu-dominio.com>`). Os e-mails chegam ao Gmail ou outro provedor; não é necessário acesso à caixa de entrada Google.

Os convites possuem token aleatório de 256 bits, hash armazenado, validade de sete dias, aceite explícito e destinatário validado pelo e-mail Google. Até três convites pendentes/aceitos/em envio ocupam lugares. A transação SQLite impede ultrapassar o limite. Acesso é checado em toda leitura e download; revogar bloqueia imediatamente futuras requisições. O texto antes de convidar informa que anotações e currículos também são compartilhados.

O envio usa chave de idempotência no Resend. Se não for possível confirmar o envio, o convite é invalidado mesmo que o e-mail eventualmente chegue; o usuário pode enviar outro. Uma mensagem “enviada” confirma aceitação pelo serviço, não entrega na caixa de entrada.

Documentação: https://resend.com/docs/api-reference/emails/send-email

### Leitura por IA

Preencha `OPENAI_API_KEY` e opcionalmente `OPENAI_MODEL` (padrão `gpt-4.1-mini`, substituível por modelo com visão e Structured Outputs compatível com Responses). Configure limite de gastos na sua conta. O conteúdo selecionado é enviado à OpenAI somente após o usuário clicar em Extrair informações; a interface explica esse envio.

A API Responses usa JSON Schema estrito e `store:false`. Link público HTTPS é lido pelo servidor com bloqueio de endereços privados, DNS fixado na conexão, validação a cada redirecionamento, limite de tamanho e timeout. Páginas com bloqueio, login, CAPTCHA ou conteúdo apenas dinâmico podem exigir texto ou print. A IA não salva vagas automaticamente: sempre retorna rascunho revisável. Não existem chamadas de IA simuladas.

Documentação: https://developers.openai.com/api/docs/guides/images-vision e https://developers.openai.com/api/docs/guides/structured-outputs

## Produção

```powershell
npm ci
npm run check
npm test
npm run build
# Configure ALLOW_DEMO=false, APP_URL=https://seu-dominio e os segredos antes:
npm start
```

Hospede em Node 24 com **volume persistente** para `DATABASE_PATH` (padrão `./data/opportunities.sqlite`) e HTTPS em proxy reverso. Uma única instância é o alvo inicial. Não usar filesystem efêmero/serverless para o banco. Sem serviços externos configurados, Google, IA e convites ficam indisponíveis com avisos honestos. O servidor recusa produção com demonstração habilitada.

Faça backups consistentes do SQLite com a API de backup ou com o servidor parado; no modo WAL, copiar apenas o arquivo principal enquanto está aberto pode perder mudanças recentes. Proteja backups porque contêm currículos e dados pessoais. Não coloque `data/` no diretório estático servido. Arquivos de até 5 MB são armazenados como BLOB, validados por MIME e assinatura e baixados apenas após autorização.

## Funcionamento

- Cinco etapas: No radar, Candidatura enviada, Em entrevista, Proposta recebida e Encerradas.
- Drag and drop com alternativa acessível no campo Etapa; histórico preservado.
- Busca por empresa/cargo, filtro por plataforma e modalidade, visualização em lista e arquivo reversível.
- Prioridade, salário, modalidade, contratação, link, descrição, requisitos, benefícios, prazo, contato, anotações e próximo passo.
- Currículo PDF vinculado à candidatura, data de envio e acompanhamento por plataforma.
- Checklist de cadastro, perfil, alertas e currículo por plataforma.
- Agenda de acompanhamento com datas e indicação de atraso; não envia lembretes automaticamente.
- Compartilhamento com perfis Apenas visualização e Contribuinte, até três convidados por proprietário. Seletor de quadros após login para quem acompanha outras pessoas.
- Controle de versão para rejeitar gravações desatualizadas de outra aba.

## Verificação

`npm test` cobre autorização, CSRF, convites, limite/expiração/revogação, versão de registros, arquivos e proteção SSRF. `npm run check` verifica TypeScript; `npm run build` compila produção. O fluxo real dos provedores depende de credenciais e deve ser validado com duas contas Google e e-mails reais antes de disponibilizar a outras pessoas.

## Limitações conhecidas

- Sem exclusão de conta/arquivo e política automática de retenção; administração desses dados depende de operação do banco nesta versão. Definir esses fluxos antes de oferecer como serviço público amplo.
- Sem antivírus de anexos, auditoria externa de segurança, backup automatizado, multi-instância ou notificações push.
- Workspace completo é carregado em memória no cliente, apropriado ao acompanhamento pessoal; paginação do servidor fica para bases maiores.
- Revogar acesso não apaga arquivos já baixados pelo convidado.
- Alterar um registro de currículo substitui a referência para todas as vagas vinculadas. Para preservar uma versão enviada, crie outro currículo.

Veja [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md) e [UX-CONTRACT.md](UX-CONTRACT.md).

## Contribuintes e currículo enviado
Em Compartilhamento, escolha Apenas visualização ou Contribuinte ao convidar. O titular também pode alterar o perfil de convites pendentes ou aceitos. O contribuinte adiciona/edita oportunidades, anexa prints e registra envio e etapas, sempre no quadro escolhido. Administração de convites, plataformas, currículos PDF e arquivamento fica com o titular.

No formulário da vaga, marque “Currículo enviado?” e informe quem enviou (titular ou contribuinte em nome do titular) e a data. Isso é um registro do envio já realizado, não uma candidatura automática. O histórico identifica quem lançou a informação e quem adicionou a vaga.

Ao iniciar, o banco existente recebe automaticamente a coluna de perfil, mantendo convidados anteriores como visualizadores. Não há exclusão de registros nessa migração. Os testes adicionais verificam autoria, escrita no quadro correto, downgrade, revogação e restrições por perfil.

## Foto do perfil e navegação
Nome e foto vêm da conta Google e são atualizados ao entrar. Sem foto ou se a imagem não carregar, aparecem as iniciais. A foto também identifica convidados que já aceitaram e autores no histórico. Contas antigas precisam entrar novamente para sincronizar a foto.

A interface é SPA: menu à esquerda no desktop, conteúdo dinâmico à direita, navegação sem recarregar e suporte a Voltar/Avançar. No celular, o menu se adapta para uma barra compacta no topo.

## GitHub e GitHub Pages
Repositório: https://github.com/AndreSuckow/oportunidades-online
Prévia estática: https://andresuckow.github.io/oportunidades-online/

O Pages publica somente a demonstração com dados fictícios. Cadastro/edição, filtros, plataformas, currículos e etapas funcionam em memória da aba. Atualizar a página descarta as alterações e anexos. Não há login real, envio de convites, sincronização de contas ou IA nessa versão estática. A aplicação completa continua em Node no localhost.

Build da demonstração: npm run build:pages (pasta dist-pages). Prévia do build: npm run preview:pages. O build normal npm run build continua independente e usa a API real.

O workflow .github/workflows/pages.yml usa apenas workflow_dispatch: publicação manual, sem gatilho por push. Após a publicação inicial, nenhuma alteração deve ser enviada ou publicada sem nova solicitação do usuário. Consulte AGENTS.md.

Para subir novamente o ambiente local: npm run dev e acessar http://localhost:3000. Encerrar o terminal encerra o servidor.
