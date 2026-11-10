# Contrato de experiência

Fonte de regras de negócio e permissões: [PRODUCT.md](PRODUCT.md). Fonte visual: [DESIGN.md](DESIGN.md). Produto em português brasileiro, datas de acompanhamento como datas civis, exibição de instantes no fuso America/Sao_Paulo.

| Capacidade | Responsável canônico | Variantes | Verificação |
|---|---|---|---|
| Select/Listbox | select HTML nativo em src/main.tsx | simples, plataforma, etapa | teclado e popup nativo |
| Date | input type=date nativo | prazo, envio, acompanhamento | plataforma controla popup e idioma do calendário |
| Form | Field, ErrorBox e formulários de src/main.tsx; schemas server/validation.js | criar e editar | validação cliente + servidor |
| Scrollbar | regras globais em src/styles.css | quadro horizontal e diálogo vertical | herança global, forced-colors |
| Toast | notice em App | confirmação de sucesso | live region |
| CRUD | mutate / API / version | salvar retorna à lista de origem; arquivar/restaurar com confirmação | tests/security.test.js |

Filtros de busca e plataforma e tela ativa persistem na URL. Modalidade e arquivo são transitórios. Busca local imediata, sem chamadas por tecla. Quadro limita cada etapa a 20 itens inicialmente e oferece carregar mais; lista usa lotes de 20. Dados completos do workspace são carregados para indicadores e filtros, portanto esta versão é voltada a acompanhamento pessoal, não bases corporativas grandes.

Diálogos usam HTML dialog.showModal para foco modal, fundo inerte e Escape. Fechamento do editor de vaga e formulários de ativos confirma perda de alterações. Edição da vaga registra beforeunload. Ações perigosas e convites exibem alcance antes da confirmação. Arquivar é reversível; não há exclusão permanente nesta versão.

Qualquer drag do cartão tem alternativa por select Etapa no editor. Titular gerencia convites, plataformas, biblioteca de currículos e arquivamento. Contribuinte vê ações de criação/edição de vagas, prints, importação e etapas. Visualizador não vê ações de escrita. O servidor revalida perfil e proprietário do quadro a cada requisição, inclusive em arquivos. Revogação interrompe leituras futuras, sem conseguir recolher arquivos já baixados.

Carregamento usa indicador próprio com região estável. Falhas mostram mensagem persistente e preservam dados do formulário. Escritas não são otimistas. Conflito de versão retorna 409, preserva o formulário e exige recarga; sem mesclagem automática. Não há gravação offline; a interface informa a desconexão. Cada sucesso de gravação atualiza os dados do quadro.

Acessibilidade pretendida: WCAG 2.2 AA, controles nativos, foco visível, rótulos, retorno de foco ao fechar diálogos, movimento reduzido e estrutura responsiva. Auditoria estática não comprova conformidade completa.

## Participação e candidatura
Conforme PRODUCT.md: seleção nativa de perfil no convite e em cada convidado ativo. Alterar perfil exige confirmação com o alcance da nova permissão. Banner e seletor de quadro distinguem Apenas visualização, Contribuinte e titular.

O editor compartilhado oferece checkbox “Currículo enviado?”, remetente titular/contribuinte e data. O cartão mostra o estado e a autoria; o histórico mostra o ator do registro. Prints/importações usam o owner do quadro selecionado, nunca implicitamente o usuário autenticado. Convidados não recebem os controles da biblioteca ou de compartilhamento.

## Avatar e rotas
Avatar em src/components.tsx é o componente compartilhado: imagem 1:1, tamanho reservado, object-fit cover, referrerPolicy no-referrer, fallback com iniciais. Nome permanece em texto; imagem é decorativa para leitores de tela. Não há upload de foto personalizado nesta versão.

useNavigation em src/useNavigation.ts controla view/q/platform na URL. Mudança de área usa pushState, filtros replaceState, popstate restaura os três. Menu com aria-current e nome acessível, link de pular para conteúdo. Desktop usa sidebar à esquerda e conteúdo à direita; celular mantém menu compacto no topo.

## Modo Pages
A demonstração estática reutiliza todos os componentes e navegação, com adaptador explícito pagesDemo. A tela de entrada e o banner explicam limitações e descarte ao atualizar. Nenhuma chamada ao backend é realizada neste modo. Uploads são Blob URLs temporários e não saem da aba. Login e ações externas continuam desabilitados.
