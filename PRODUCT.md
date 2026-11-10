# Oportunidades Online

Fonte: solicitação do usuário nesta conversa, 10/11/2026. Aplicação pessoal de acompanhamento de vagas, semelhante a um quadro Trello, com login Google, cadastro de plataformas, currículos por candidatura e importação de anúncio por link/print.

## Regras implementadas
- Login exclusivamente por Google em produção. Conta identificada pelo `sub` validado, nunca pelo e-mail enviado pelo navegador.
- Cada pessoa possui seu quadro, plataformas e currículos. Contas reais começam vazias, com cinco plataformas sugeridas ainda não marcadas como cadastradas.
- Até três convites ativos por proprietário, incluindo os pendentes. O convite é enviado por e-mail, expira em sete dias e requer aceite explícito com a conta Google do destinatário. O aceite concede o perfil definido pelo titular: apenas visualização ou contribuinte. Convites antigos são migrados para apenas visualização. Depois do aceite, o acesso dura até revogação.
- Ambos os perfis podem ler todas as vagas (inclusive arquivadas), anotações, plataformas e currículos anexados do proprietário. Essa abrangência aparece antes de convidar. O proprietário pode revogar imediatamente.
- Um usuário pode acompanhar vários proprietários; um seletor diferencia “Minhas oportunidades” de “Oportunidades de …”.
- Vagas podem mudar livremente de etapa e o servidor registra o histórico. Data da candidatura não é apagada nas transições. Arquivamento é reversível.
- O currículo vinculado à vaga é uma versão identificada. Envie novas versões como novos currículos; editar um currículo existente altera o arquivo referenciado pelas vagas que usam esse registro.
- IA extrai apenas o material enviado em rascunho revisável. Campos ausentes ficam vazios. A gravação é explícita. Prints ficam em armazenamento privado e só são enviados à IA após a ação Extrair.
- Demonstração opcional: só em desenvolvimento, por conexão loopback, cria dados fictícios isolados por sessão. Nunca habilitar em ambiente público.

## Limites operacionais
Uma instância Node com volume persistente SQLite. Sem agenda externa, notificações de prazo por e-mail, candidatura automática ou acesso à caixa Gmail. E-mails transacionais vão ao endereço convidado via Resend. O usuário pode receber esses e-mails no Gmail sem conceder acesso à caixa de entrada.

## Perfis e registro de envio (atualização solicitada pelo usuário)
- Apenas visualização: consulta todo o acompanhamento, sem escrita.
- Contribuinte: cria e edita vagas, anexa prints, importa link/print/texto com IA, registra envio e atualiza etapas no quadro do titular. Não gerencia convidados, plataformas, biblioteca de currículos nem arquivamento.
- O titular define o perfil ao convidar e pode alterá-lo em convites pendentes ou aceitos. Mudanças/revogação são aplicadas no servidor mesmo em abas antigas; convites expirados/revogados não podem ser reativados pela troca de perfil.
- Os dois perfis compartilham o limite de três convidados. Convites anteriores à alteração recebem visualização por padrão.
- “Currículo enviado?” registra a candidatura do titular do quadro. “Quem enviou” distingue titular de contribuinte atuando em seu nome. Marcar não envia arquivo à empresa. O usuário escolhe quem realizou o envio; o servidor registra separadamente a identidade de quem lançou a informação.
- Registro inclui data do envio, autor da vaga e histórico atribuído das etapas e alterações da marcação. Autoria não é aceita do cliente. Dados antigos sem autoria permanecem sem autoria inventada.
- Marcar enviado em No radar muda para Candidatura enviada. Desmarcar limpa remetente/data e retorna de Candidatura enviada para No radar, preservando demais etapas e o histórico.
- Anexos enviados pelo contribuinte pertencem ao quadro escolhido e continuam acessíveis ao titular após revogar o convidado. Contribuintes podem enviar imagens; a biblioteca PDF é administrada pelo titular.

## Identidade visual e navegação SPA
Foto de perfil obtida do atributo picture do ID token Google validado. Nome e foto atualizam a cada login; contas existentes recebem foto vazia até entrar novamente. Fotos aceitas apenas por HTTPS em googleusercontent.com e seus subdomínios. Nenhuma foto de convidado pendente é buscada por e-mail; aparece após o aceite vinculá-lo à conta. Autores têm foto registrada com a ação, como o nome. Sem foto ou em erro de carregamento, exibir iniciais.

O aplicativo mantém o menu lateral e a sessão montados, substituindo apenas o conteúdo da área. Navegação entre quadro, plataformas, currículos, próximos passos e compartilhamento não recarrega a página. Histórico do navegador restaura área e filtros; filtros usam replaceState para evitar uma entrada por caractere digitado. Login Google e saída continuam sendo navegações completas.

## Prévia pública no GitHub Pages
Solicitação do usuário: primeiro commit e primeira publicação no GitHub; futuras alterações somente locais até nova autorização. Repositório oportunidades-online, conta AndreSuckow. Pages é uma demonstração isolada em memória, com aviso visível e sem credenciais, banco, dados pessoais, IA ou convites reais. A versão normal continua usando o servidor Node.
