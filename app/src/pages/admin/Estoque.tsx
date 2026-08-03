import { useProdutos } from '../../lib/produtosStore'
import { useMovimentosEstoque } from '../../lib/estoqueStore'
import EmptyState from '../../components/EmptyState'
import type { TipoMovimentoEstoque } from '../../lib/types'

const TIPO_LABEL: Record<TipoMovimentoEstoque, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  perda: 'Perda',
  ajuste: 'Ajuste',
}
const TIPO_CLASSE: Record<TipoMovimentoEstoque, string> = {
  entrada: 'text-success',
  saida: 'text-black/60 dark:text-white/60',
  perda: 'text-danger',
  ajuste: 'text-warning',
}

// Estoque (Capítulo 7.6 do PRD) — saldo em tempo real (RF-EST-02), alerta de
// mínimo (RF-EST-03) e log de movimentos (RF-EST-01). O decremento
// automático na venda (RF-EST-04) e a entrada por recebimento de compra
// (RF-COM-02) já alimentam o mesmo log real via lib/estoqueStore.ts.
export default function Estoque() {
  const produtos = useProdutos()
  const movimentos = useMovimentosEstoque()
  const baixos = produtos.filter((p) => p.estoqueAtual <= p.estoqueMinimo)

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-semibold text-lg mb-3">Estoque</h2>
        {baixos.length === 0 ? (
          <p className="text-sm text-black/40 dark:text-white/40">Nenhum produto com estoque abaixo do mínimo.</p>
        ) : (
          <div className="space-y-2">
            {baixos.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{p.nome}</p>
                  <p className="text-xs text-black/40 dark:text-white/40">Mínimo: {p.estoqueMinimo}</p>
                </div>
                <span className="text-sm font-medium font-[var(--font-mono-fin)] text-danger">{p.estoqueAtual}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Movimentos recentes</h3>
        {movimentos.length === 0 ? (
          <EmptyState title="Nenhum movimento ainda" description="Vendas, compras recebidas e ajustes vão aparecer aqui." />
        ) : (
          <div className="space-y-1.5">
            {movimentos.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-black/10 dark:border-white/10 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.produto.nome}</p>
                  <p className="text-xs text-black/40 dark:text-white/40">
                    {m.motivo} · {new Date(m.data).toLocaleString('pt-BR')}
                  </p>
                </div>
                <span className={`text-sm font-medium font-[var(--font-mono-fin)] shrink-0 ${TIPO_CLASSE[m.tipo]}`}>
                  {TIPO_LABEL[m.tipo]} {m.quantidade > 0 ? '+' : ''}
                  {m.quantidade}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
