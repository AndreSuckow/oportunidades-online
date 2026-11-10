---
version: alpha
name: "Oportunidades Online"
description: "Um espaço de trabalho calmo, com quadro de candidaturas em tons de jardim e verde sóbrio."
colors:
  primary: "#315d4a"
  primary-hover: "#244b3a"
  ink: "#263b34"
  muted: "#65736d"
  line: "#dfe6e1"
  surface: "#ffffff"
  canvas: "#f6f8f7"
  mint: "#e8f0e9"
  accent: "#ddeb9d"
  danger: "#aa3434"
typography:
  sans:
    fontFamily: "Segoe UI, Arial, sans-serif"
  display:
    fontFamily: "Trebuchet MS, Segoe UI, sans-serif"
rounded:
  DEFAULT: "7px"
  sm: "4px"
  md: "9px"
  lg: "13px"
spacing:
  section-gap: "30px"
  page-max: "1800px"
components:
  button: {}
  card: {}
  dialog: {}
  field: {}
  navigation: {}
---

## Overview
### Creative North Star
Uma mesa de planejamento pessoal: cartões como fichas de candidaturas, etapas como trilhas visíveis, linguagem tranquila para uma busca profissional que pode ser desgastante.

### Product context and register
Pessoas acompanhando a própria busca e até três pessoas de confiança. Contexto brasileiro e linguagem pt-BR derivados do pedido em português e dos exemplos de plataformas; sem necessidades do mercado japonês. Uso diário em desktop, consulta em celular. Registro de produto, sem promessas de contratação.

A assinatura é o conjunto de cinco trilhas suavemente coloridas e cartões compactos, com a origem da candidatura ancorada no rodapé. Controles, dados e navegação ficam discretos. Não usar dashboards financeiros, grandes gradientes ou decoração que concorra com as vagas.

Tokens são canônicos em `src/styles.css :root`; este documento espelha esses valores. Alterações da paleta devem atualizar ambos. Cores de etapas e logotipos textuais são variantes locais declaradas no CSS, nunca logotipos oficiais de empresas fictícias.

## Colors
Verde primary para ação; canvas cinza esverdeado para o espaço; surface branca para conteúdo. Accent reservado à marca; mint para seleção. Etapas acrescentam tons desaturados de cinza, azul, âmbar e verde, sempre com rótulos. Danger identifica revogação ou descarte. Não há tema escuro. Forced-colors conserva bordas e scrollbars do sistema.

## Typography
Trebuchet MS em títulos, números e marca; Segoe UI em controles e texto. Fontes locais evitam downloads e troca tardia. Título principal 34px no desktop e 27px no celular. Texto de formulário 13px; informação secundária menor acompanha quadro de densidade moderada. Datas com pt-BR e números tabulares.

## Layout
Sidebar 236px; topo 67px; conteúdo com padding 34px. Cinco colunas de no mínimo 220px, com rolagem horizontal do próprio quadro. Em 800px a sidebar compacta; em 520px transforma em navegação superior. Formulários usam duas colunas, uma no celular; listas de plataformas e currículos passam de três para duas e uma. Nenhuma altura fixa no conteúdo principal.

## Elevation & Depth
Hierarquia por fundos e bordas. Sombra muito leve nos cartões; sombra forte apenas no diálogo modal. Login usa uma representação do quadro, identificável como ilustração e escondida de leitores de tela.

## Shapes
Botões 7px, cartões 7–10px, diálogos 13px. Avatar quadrado arredondado, ponto de etapa circular. Ícones lineares Lucide em 16–22px. Não substituir ações importantes por ícones sem rótulos acessíveis.

## Components
### Foundational visual states
Hover escurece a ação ou suaviza fundo. Focus-visible com contorno verde de 3px. Disabled mantém o lugar do controle e explica indisponibilidade do provedor. Erros em área persistente; sucesso em live region. Carregamento em spinner, sem skeleton.
### Buttons and actions
Ação principal sólida, secundária branca com borda, terciária texto. Danger reservado a descarte/revogação. Botões incluem texto e ícone quando melhora reconhecimento.
### Navigation and data display
Uma navegação compartilhada entre telas. Badges pequenos para modalidade, prioridade, estado do convite. Indicadores derivam dos dados reais do workspace, nunca números de marketing. Vagas fictícias apenas na demonstração explícita.
### Forms and overlays
Field e ErrorBox são compartilhados. Dialog nativo modal. Select e date são nativos e aceitam geometria e locale do sistema. Textareas sem redimensionamento manual, com rolagem e expansão de foco. Upload oferece seletor de arquivo; sem zona falsa de arrastar.
### Iconography
Lucide React, traço padrão, ícones funcionais. Marcas de empresas são iniciais, e plataformas têm identificação textual.
### Motion
Transições de 150ms nos estados de controle. Sem animação contínua exceto carregamento. prefers-reduced-motion remove transições.
### Content and data visualization
Português direto. “Salvar oportunidade”, “Candidatura enviada”, “Revogar”. Plataformas mostram contagem por etapa e checklist 0/4 a 4/4 com texto equivalente.

## Do's and Don'ts
- Manter origem e currículo ligados à vaga, não apenas contagens globais.
- Preservar o mesmo formulário, feedback e comportamento de salvar entre telas.
- Não usar dados fictícios na conta Google real.
- Não afirmar que e-mail foi enviado ou que IA extraiu dados quando o provedor não respondeu.

## Extensão de colaboração
Os perfis usam os selects nativos existentes e confirmação compartilhada. A marcação de envio usa painel de canvas com borda line, texto primary e checkbox nativo; o cartão acrescenta um estado textual e autor sem depender apenas da cor. Nenhum token visual foi alterado.

## Fotos e estrutura SPA
Avatar mantém as dimensões e raios existentes, recorta a foto com object-fit cover e usa iniciais como fallback. Nome continua visível junto à foto nos contextos de identidade; autores de ações usam variante tiny de 23px. A estrutura sidebar/main permanece montada na navegação, preservando o alinhamento e os tokens atuais.
