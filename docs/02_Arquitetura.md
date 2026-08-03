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
| **Dashboard** | ✅ Funcional (mock) | `pages/admin/Dashboard.tsx` | Indicadores + ranking, dados fake de `lib/mockData.ts` |
| **PDV / Vendas** | ✅ Funcional (mock) | `pages/admin/PDV.tsx` | Busca + carrinho; sem leitor de câmera ainda |
| **Produtos** | ✅ Funcional (mock) | `pages/admin/Produtos.tsx` | Tabela com paginação |
| **Categorias e Marcas** | ✅ Funcional (mock) | `pages/admin/Categorias.tsx` | Árvore de categorias + chips de marca |
| **Fornecedores** | ✅ Funcional (mock) | `pages/admin/Fornecedores.tsx` | Cadastro + histórico de compras por fornecedor |
| **Compras** | ✅ Funcional (mock) | `pages/admin/Compras.tsx` | Pedidos com status (pendente/parcial/recebido) |
| **Estoque** | ✅ Funcional (mock) | `pages/admin/Estoque.tsx` | Alerta de mínimo + log de movimentos |
| **Caixa** | ✅ Funcional (mock) | `pages/admin/Caixa.tsx` | Abertura/sangria/suprimento/fechamento (em memória) |
| **Financeiro** | ✅ Funcional (mock) | `pages/admin/Financeiro.tsx` | DRE simplificado por período |
| **Relatórios** | ✅ Funcional (mock) | `pages/admin/Relatorios.tsx` | Vendas por produto + giro de estoque por categoria |
| **Vendas (histórico completo)** | ✅ Funcional (mock) | `pages/admin/Vendas.tsx` | Lista o que o PDV registrou via `lib/vendasStore.ts` |
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
| `lib/mockData.ts` | Todos os dados fake usados em toda tela do painel (Produtos, Categorias, Fornecedores, Compras, Estoque, Caixa, Financeiro, Relatórios). **É aqui que entra o backend de verdade no futuro.** |
| `lib/vendasStore.ts` | Registro/histórico de vendas — a única "persistência" real hoje (localStorage), permite o PDV e a tela de Vendas se comunicarem de verdade. |
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
