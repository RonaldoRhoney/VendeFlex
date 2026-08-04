import { useState } from 'react'
import { avancarStatusCompra, criarCompra, useCompras } from '../../lib/comprasStore'
import { useFornecedores } from '../../lib/fornecedoresStore'
import { useProdutos } from '../../lib/produtosStore'
import { formatarReais } from '../../lib/format'
import EmptyState from '../../components/EmptyState'
import Toast, { type ToastData } from '../../components/admin/Toast'
import type { ItemCompra, StatusCompra } from '../../lib/types'

const STATUS_LABEL: Record<StatusCompra, string> = { pendente: 'Pendente', parcial: 'Parcial', recebido: 'Recebido' }
const STATUS_CLASSE: Record<StatusCompra, string> = {
  pendente: 'text-warning border-warning/30 bg-warning/10',
  parcial: 'text-accent border-accent/30 bg-accent/10',
  recebido: 'text-success border-success/30 bg-success/10',
}
const PROXIMO_LABEL: Record<StatusCompra, string> = {
  pendente: 'Marcar Parcial',
  parcial: 'Marcar Recebido',
  recebido: '',
}

// Compras (Capítulo 7.5 do PRD) — RF-COM-01 (criar pedido) e RF-COM-03
// (avançar status) agora reais. Ao marcar "Recebido", RF-COM-02 gera
// entrada de estoque de verdade (lib/comprasStore.ts → lib/estoqueStore.ts).
export default function Compras() {
  const compras = useCompras()
  const fornecedores = useFornecedores()
  const produtos = useProdutos()
  const [formAberto, setFormAberto] = useState(false)
  const [fornecedorId, setFornecedorId] = useState('')
  const [itens, setItens] = useState<ItemCompra[]>([])
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [toast, setToast] = useState<ToastData | null>(null)

  function adicionarItem() {
    const produto = produtos.find((p) => p.id === produtoId)
    const qtd = Number(quantidade)
    if (!produto || !qtd || qtd <= 0) return
    setItens((prev) => [...prev, { produto, quantidade: qtd, precoUnitario: produto.precoCusto }])
    setProdutoId('')
    setQuantidade('')
  }

  async function criarPedido() {
    const fornecedor = fornecedores.find((f) => f.id === fornecedorId)
    if (!fornecedor || itens.length === 0) return
    try {
      await criarCompra(fornecedor, itens)
      setFornecedorId('')
      setItens([])
      setFormAberto(false)
      setToast({ mensagem: 'Pedido de compra criado.', tipo: 'sucesso' })
    } catch (err) {
      setToast({ mensagem: err instanceof Error ? err.message : 'Erro ao criar pedido.', tipo: 'erro' })
    }
  }

  async function avancar(id: string) {
    try {
      await avancarStatusCompra(id)
      setToast({ mensagem: 'Status do pedido atualizado.', tipo: 'sucesso' })
    } catch (err) {
      setToast({ mensagem: err instanceof Error ? err.message : 'Erro ao atualizar pedido.', tipo: 'erro' })
    }
  }

  return (
    <div className="max-w-3xl space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-lg">Compras</h2>
        <button
          onClick={() => setFormAberto((v) => !v)}
          className="text-xs rounded-lg bg-seg-primary text-white px-3 py-2 font-medium"
        >
          {formAberto ? 'Fechar' : '+ Novo pedido'}
        </button>
      </div>

      {formAberto && (
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1">Fornecedor</label>
            <select
              value={fornecedorId}
              onChange={(e) => setFornecedorId(e.target.value)}
              className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
            >
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium block mb-1">Produto</label>
              <select
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
                className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
              >
                <option value="">Selecione</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="text-xs font-medium block mb-1">Qtd.</label>
              <input
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="w-full border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
              />
            </div>
            <button
              type="button"
              onClick={adicionarItem}
              className="rounded-lg border border-black/15 dark:border-white/15 px-3 py-2 text-sm font-medium"
            >
              Adicionar item
            </button>
          </div>

          {itens.length > 0 && (
            <div className="space-y-1">
              {itens.map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-black/60 dark:text-white/60">
                  <span>
                    {item.quantidade}× {item.produto.nome}
                  </span>
                  <span className="font-[var(--font-mono-fin)]">{formatarReais(item.quantidade * item.precoUnitario)}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={criarPedido}
            disabled={!fornecedorId || itens.length === 0}
            className="rounded-lg bg-seg-primary text-white px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Criar pedido
          </button>
        </div>
      )}

      {compras.length === 0 ? (
        <EmptyState title="Nenhum pedido de compra" description="Clique em “+ Novo pedido” pra criar o primeiro." />
      ) : (
        compras.map((compra) => {
          const total = compra.itens.reduce((soma, i) => soma + i.quantidade * i.precoUnitario, 0)
          return (
            <div key={compra.id} className="rounded-xl border border-black/10 dark:border-white/10 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                <div>
                  <p className="text-sm font-medium">{compra.fornecedor.nome}</p>
                  <p className="text-xs text-black/40 dark:text-white/40">
                    Pedido em {new Date(compra.dataPedido).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`text-xs rounded-full border px-2.5 py-1 font-medium shrink-0 ${STATUS_CLASSE[compra.status]}`}>
                  {STATUS_LABEL[compra.status]}
                </span>
              </div>
              <div className="space-y-1 mb-2">
                {compra.itens.map((item) => (
                  <div key={item.produto.id} className="flex justify-between text-xs text-black/60 dark:text-white/60">
                    <span>
                      {item.quantidade}× {item.produto.nome}
                    </span>
                    <span className="font-[var(--font-mono-fin)]">{formatarReais(item.quantidade * item.precoUnitario)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-2 text-sm font-medium">
                <span>Total</span>
                <span className="font-[var(--font-mono-fin)]">{formatarReais(total)}</span>
              </div>
              {compra.status !== 'recebido' && (
                <button
                  onClick={() => avancar(compra.id)}
                  className="mt-3 text-xs rounded-lg border border-black/15 dark:border-white/15 px-3 py-2 font-medium min-h-[44px]"
                >
                  {PROXIMO_LABEL[compra.status]}
                </button>
              )}
            </div>
          )
        })
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
