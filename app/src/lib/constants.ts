// Módulos do painel admin (Capítulo 4 do PRD), em ordem lógica de
// dependência (Cap. 4.4): Produtos/Categorias antes de Compras/PDV;
// Compras/Fornecedores antes de Estoque; PDV antes de Caixa; Vendas/Compras
// antes de Financeiro/Relatórios.
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
  { id: 'categorias', label: 'Categorias e Marcas', icone: '🏷️', emConstrucao: false },
  { id: 'fornecedores', label: 'Fornecedores', icone: '🤝', emConstrucao: false },
  { id: 'compras', label: 'Compras', icone: '🛒', emConstrucao: false },
  { id: 'estoque', label: 'Estoque', icone: '🗃️', emConstrucao: false },
  { id: 'caixa', label: 'Caixa', icone: '💵', emConstrucao: false },
  { id: 'financeiro', label: 'Financeiro', icone: '💰', emConstrucao: false },
  { id: 'relatorios', label: 'Relatórios', icone: '📈', emConstrucao: false },
  { id: 'configuracoes', label: 'Configurações', icone: '⚙️', emConstrucao: true },
]

// Slots fixos do bottom-tab-bar mobile (Cap. 12.8 do PRD) — os módulos
// restantes ficam atrás de "Mais".
export const MODULOS_TAB_BAR_MOBILE = ['pdv', 'estoque', 'vendas'] as const
