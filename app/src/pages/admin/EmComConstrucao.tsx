import EmptyState from '../../components/EmptyState'

interface EmComConstrucaoProps {
  modulo: string
}

// Placeholder reutilizado por todos os módulos do MVP que ainda não têm
// tela própria nesta primeira leva (Fornecedores, Compras, Estoque, Caixa,
// Financeiro, Relatórios, Permissões) — ver plano de scaffold.
export default function EmComConstrucao({ modulo }: EmComConstrucaoProps) {
  return (
    <EmptyState
      icon={<span className="text-3xl">🚧</span>}
      title={`${modulo} em construção`}
      description="Este módulo ainda não foi implementado nesta fase — a navegação já existe pra você ver a estrutura completa do painel."
    />
  )
}
