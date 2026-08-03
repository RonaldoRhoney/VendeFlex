import { COMPRAS_MOCK, FORNECEDORES_MOCK } from '../../lib/mockData'

// Fornecedores (Capítulo 7.4 do PRD) — cadastro + histórico de compras por
// fornecedor (RF-FOR-02), dados mockados.
export default function Fornecedores() {
  return (
    <div className="max-w-3xl space-y-3">
      <h2 className="font-semibold text-lg mb-1">Fornecedores</h2>
      {FORNECEDORES_MOCK.map((f) => {
        const historico = COMPRAS_MOCK.filter((c) => c.fornecedor.id === f.id)
        return (
          <div key={f.id} className="rounded-xl border border-black/10 dark:border-white/10 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-medium">{f.nome}</p>
                <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">{f.contato}</p>
              </div>
              <span className="text-xs rounded-full border border-black/10 dark:border-white/10 px-2.5 py-1 text-black/60 dark:text-white/60 shrink-0">
                Pagamento: {f.condicoesPagamento}
              </span>
            </div>
            {historico.length > 0 && (
              <p className="text-xs text-black/40 dark:text-white/40 mt-3">
                {historico.length} pedido{historico.length > 1 ? 's' : ''} de compra registrado
                {historico.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
