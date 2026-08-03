# VendeFlex — Mapa de Módulos e Arquitetura

Este documento existe pra você (ou qualquer pessoa) saber, em segundos, **onde no código está cada parte do app**. Toda vez que um módulo novo for implementado, atualize a tabela correspondente aqui.

Caminho base de tudo abaixo: `VendeFlex/app/src/`

---

## 1. Como o projeto está organizado (visão geral)

```
app/src/
├── lib/            → regras/dados/lógica sem interface (nada de HTML aqui)
├── components/     → peças de interface reutilizáveis em várias telas
├── pages/           → telas institucionais (site público)
└── pages/admin/     → telas do painel (o "sistema" de verdade)
```

Regra simples pra achar qualquer coisa: **"é uma tela?" → `pages/`. "é lógica/dado?" → `lib/`. "é um pedaço de interface repetido em mais de uma tela?" → `components/`.**

---

## 2. Módulos do painel (Capítulo 4 do PRD) — status e localização

Ordem de construção segue a cadeia de dependência do Capítulo 4.4 do PRD (Produtos/Categorias antes de Compras/PDV; Compras/Fornecedores antes de Estoque; PDV antes de Caixa; Vendas/Compras antes de Financeiro/Relatórios).

| Módulo | Status nesta fase | Arquivo da tela | Observação |
|---|---|---|---|
| **Onboarding / Design Inteligente** | ✅ Funcional (mock) | `pages/admin/Onboarding.tsx` | Seletor de segmento com troca de tema ao vivo |
| **Dashboard** | ✅ Funcional (mock) | `pages/admin/Dashboard.tsx` | Indicadores + ranking calculados de verdade por `lib/analytics.ts` a partir de `useVendas()` (antes eram fórmulas fixas) |
| **PDV / Vendas** | ✅ Funcional (mock) | `pages/admin/PDV.tsx` | Busca + carrinho; decrementa estoque real via `lib/estoqueStore.ts` na venda; desconto por venda sem limite por papel (sem sistema de permissão ainda); sem leitor de câmera ainda |
| **Produtos** | ✅ Funcional (mock) | `pages/admin/Produtos.tsx` | CRUD real (criar/editar/excluir) via `lib/produtosStore.ts`, antes era só tabela de leitura |
| **Categorias e Marcas** | ✅ Funcional (mock) | `pages/admin/Categorias.tsx` | Criar categoria/subcategoria/marca via `lib/categoriasStore.ts`, antes era só leitura |
| **Fornecedores** | ✅ Funcional (mock) | `pages/admin/Fornecedores.tsx` | Criar fornecedor via `lib/fornecedoresStore.ts` + histórico de compras, antes era só leitura |
| **Compras** | ✅ Funcional (mock) | `pages/admin/Compras.tsx` | Criar pedido + avançar status via `lib/comprasStore.ts`; ao chegar em "recebido" gera entrada real de estoque, antes era só leitura |
| **Estoque** | ✅ Funcional (mock) | `pages/admin/Estoque.tsx` | Alerta de mínimo + log de movimentos real via `useMovimentosEstoque` (`lib/estoqueStore.ts`), antes lia array fixo direto |
| **Caixa** | ✅ Funcional (mock) | `pages/admin/Caixa.tsx` | Abertura/sangria/suprimento/fechamento com conciliação real (soma vendas em dinheiro do turno via `useVendas()` vs. valor informado, mostra sobra/falta) |
| **Financeiro** | ✅ Funcional (mock) | `pages/admin/Financeiro.tsx` | DRE calculado de verdade por `lib/analytics.ts` a partir de `useVendas()`, antes era fixo |
| **Relatórios** | ✅ Funcional (mock) | `pages/admin/Relatorios.tsx` | Vendas por produto + giro de estoque via `lib/analytics.ts`/`useVendas()`, antes era fixo |
| **Vendas (histórico completo)** | ✅ Funcional (mock) | `pages/admin/Vendas.tsx` | Lista vendas de `lib/vendasStore.ts`; cancelamento com estorno automático de estoque (venda cancelada continua no histórico, `cancelada: true`) |
| **Configurações** | ✅ Funcional (mock) | `pages/admin/Configuracoes.tsx` | Dados do negócio, segmento atual (+ trocar), usuários/papéis |
| **Login** | 🎭 Só visual | `pages/admin/Login.tsx` | Sem Supabase Auth real ainda |
| **Painel (orquestrador)** | ✅ | `pages/admin/Painel.tsx` | Decide Login → Onboarding → Shell |
| **Casca do painel (menu/nav)** | ✅ | `pages/admin/AdminShell.tsx` | Sidebar desktop + tab-bar mobile |

Todos os módulos do MVP do Capítulo 4 do PRD já têm tela funcional (mock). O que falta pra virar produto de verdade é só a camada de backend (autenticação real + schema Supabase) — ver `SETUP.md`.

Pra adicionar uma tela nova a um módulo hoje "em construção": crie o arquivo em `pages/admin/`, e troque a linha correspondente em `Painel.tsx` (função `renderModulo()`) pra apontar pro componente novo em vez de `EmComConstrucao`.

---

## 3. Páginas institucionais (site público, fora do painel)

| Página | Rota | Arquivo |
|---|---|---|
| Landing | `/` | `pages/Home.tsx` |
| Política de Privacidade | `/privacidade` | `pages/PoliticaPrivacidade.tsx` |
| Termos de Uso | `/termos` | `pages/TermosUso.tsx` |
| Contato | `/contato` | `pages/Contato.tsx` |

Todas as rotas ficam centralizadas em **`App.tsx`** — é o primeiro arquivo a olhar se uma URL não estiver abrindo a tela certa.

---

## 4. `lib/` — onde fica cada regra/dado (sem interface)

| Arquivo | Responsabilidade |
|---|---|
| `lib/segmentThemes.ts` | Mapa segmento → tema (cor + fonte). Coração do "Design Inteligente". |
| `lib/useSegmentTheme.ts` | Hook que aplica o tema na tela (preview) e salva a escolha (confirmar). |
| `lib/fontLoader.ts` | Carrega a fonte do segmento sob demanda (só quando precisa). |
| `lib/localStore.ts` | Fábrica genérica (`createLocalStore<T>(chave, seed)`) de "banco local" via `localStorage` — ler/salvar/hook de sincronização entre abas/telas, reaproveitada por todos os stores abaixo (padrão nasceu em `vendasStore.ts`). |
| `lib/produtosStore.ts` | CRUD real de produtos (criar/editar/excluir) sobre `localStorage`, seed vindo de `mockData.ts`. |
| `lib/categoriasStore.ts` | CRUD de categorias/subcategorias/marcas. |
| `lib/fornecedoresStore.ts` | Cadastro de fornecedores. |
| `lib/comprasStore.ts` | Pedidos de compra: criar + avançar status; ao chegar em "recebido" chama `estoqueStore.ts` pra gerar entrada real. |
| `lib/estoqueStore.ts` | Log de movimentos de estoque (`registrarMovimentoEstoque`) — único ponto de entrada pra mudar saldo de um produto, usado por PDV (venda), Compras (recebimento) e Vendas (estorno de cancelamento). |
| `lib/vendasStore.ts` | Registro/histórico de vendas — primeira "persistência" real (localStorage), inspirou o padrão de `localStore.ts`. |
| `lib/analytics.ts` | `calcularIndicadores`/`calcularRanking`/`calcularDRE` — calculam Dashboard/Financeiro/Relatórios de verdade a partir de vendas reais (`vendasStore.ts`), substituindo as fórmulas fixas que existiam em `mockData.ts`. |
| `lib/mockData.ts` | Só dados-SEMENTE usados na primeira leitura de cada store acima — nunca deve ser importado direto por uma tela; edição do usuário nunca refletiria (releria sempre o array estático). |
| `lib/types.ts` | Formato dos dados (Produto, indicadores, etc.) — TypeScript, não é banco. |
| `lib/constants.ts` | Lista de módulos do menu (nome, ícone, se está em construção). |
| `lib/format.ts` | Formatação de moeda (R$) e percentual. |
| `lib/supabaseClient.ts` | Conexão com o banco — hoje "desligada" (sem backend ainda). |

---

## 5. `components/` — peças reutilizáveis

| Componente | Onde aparece | O que faz |
|---|---|---|
| `components/Footer.tsx` | Todas as páginas institucionais | Rodapé padrão RhoneyInc (4 colunas) |
| `components/ThemeToggle.tsx` | Home + AdminShell | Botão de alternar claro/escuro |
| `components/EmptyState.tsx` | Módulos em construção, listas vazias | Tela "vazia" com ícone+texto |
| `components/Skeleton.tsx` | Qualquer lugar que ainda vai carregar dado real | Efeito de "carregando..." |
| `components/Breadcrumb.tsx` | Topo de cada tela do painel | "VendeFlex / Dashboard" |
| `components/Tooltip.tsx` | Botões só com ícone | Dica ao passar o mouse |
| `components/admin/Toast.tsx` | Ações rápidas (salvar, erro) | Aviso temporário no rodapé da tela |

---

## 6. Arquivos de configuração (raiz de `app/`)

| Arquivo | Pra que serve |
|---|---|
| `package.json` | Lista de dependências + comandos (`npm run dev`, `build`, `lint`) |
| `vite.config.ts` | Configuração do build + PWA (ícone, nome do app instalável) |
| `src/index.css` | **Todas as cores e fontes do app ficam aqui** (`@theme`) |
| `tsconfig*.json` | Configuração do TypeScript (raramente precisa mexer) |
| `.env.example` | Modelo das variáveis de ambiente (chaves do Supabase, quando existirem) |

---

## 7. Pendências e decisões registradas

Ver `SETUP.md` na raiz do projeto para a lista de pendências (trigger de admin, políticas do Google Play, login real, paletas de segmento a confirmar).
