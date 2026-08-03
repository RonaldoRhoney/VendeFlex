// Módulos do painel admin (Capítulo 4 do PRD) — nesta fase só Dashboard, PDV
// e Produtos têm tela de verdade; o resto aponta pra EmComConstrucao.tsx.
export interface ModuloNav {
  id: string
  label: string
  icone: string
  emConstrucao: boolean
}

export const MODULOS_NAV: ModuloNav[] = [
  { id: 'dashboard', label: 'Dashboard', icone: '📊', emConstrucao: false },
  { id: 'pdv', label: 'PDV', icone: '🧾', emConstrucao: false },
  { id: 'vendas', label: 'Vendas', icone: '💳', emConstrucao: true },
  { id: 'produtos', label: 'Produtos', icone: '📦', emConstrucao: false },
  { id: 'estoque', label: 'Estoque', icone: '🗃️', emConstrucao: true },
  { id: 'compras', label: 'Compras', icone: '🛒', emConstrucao: true },
  { id: 'fornecedores', label: 'Fornecedores', icone: '🤝', emConstrucao: true },
  { id: 'financeiro', label: 'Financeiro', icone: '💰', emConstrucao: true },
  { id: 'relatorios', label: 'Relatórios', icone: '📈', emConstrucao: true },
  { id: 'configuracoes', label: 'Configurações', icone: '⚙️', emConstrucao: true },
]

// Slots fixos do bottom-tab-bar mobile (Cap. 12.8 do PRD) — os módulos
// restantes ficam atrás de "Mais".
export const MODULOS_TAB_BAR_MOBILE = ['pdv', 'estoque', 'vendas'] as const
