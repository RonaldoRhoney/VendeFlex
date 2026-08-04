import { useState } from 'react'
import { criarCategoria, criarMarca, excluirCategoria, excluirMarca, useCategorias, useMarcas } from '../../lib/categoriasStore'
import EmptyState from '../../components/EmptyState'
import Toast, { type ToastData } from '../../components/admin/Toast'

// Categorias e Marcas (Capítulo 7.3 do PRD) — RF-CAT-01 (cadastrar
// categoria/subcategoria) e RF-CAT-03 (cadastrar marca) agora com
// formulário de verdade.
export default function Categorias() {
  const categorias = useCategorias()
  const marcas = useMarcas()
  const [novaCategoria, setNovaCategoria] = useState('')
  const [categoriaPai, setCategoriaPai] = useState('')
  const [novaMarca, setNovaMarca] = useState('')
  const [toast, setToast] = useState<ToastData | null>(null)

  const raiz = categorias.filter((c) => !c.categoriaPaiId)

  async function adicionarCategoria(e: React.FormEvent) {
    e.preventDefault()
    if (!novaCategoria.trim()) return
    try {
      await criarCategoria(novaCategoria.trim(), categoriaPai || null)
      setNovaCategoria('')
      setCategoriaPai('')
      setToast({ mensagem: 'Categoria cadastrada.', tipo: 'sucesso' })
    } catch (err) {
      setToast({ mensagem: err instanceof Error ? err.message : 'Erro ao cadastrar categoria.', tipo: 'erro' })
    }
  }

  async function adicionarMarca(e: React.FormEvent) {
    e.preventDefault()
    if (!novaMarca.trim()) return
    try {
      await criarMarca(novaMarca.trim())
      setNovaMarca('')
      setToast({ mensagem: 'Marca cadastrada.', tipo: 'sucesso' })
    } catch (err) {
      setToast({ mensagem: err instanceof Error ? err.message : 'Erro ao cadastrar marca.', tipo: 'erro' })
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="font-semibold text-lg mb-3">Categorias</h2>
        <form onSubmit={adicionarCategoria} className="flex flex-wrap gap-2 mb-4">
          <input
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            placeholder="Nome da categoria"
            required
            className="flex-1 min-w-[160px] border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
          />
          <select
            value={categoriaPai}
            onChange={(e) => setCategoriaPai(e.target.value)}
            className="border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
          >
            <option value="">Categoria raiz</option>
            {raiz.map((c) => (
              <option key={c.id} value={c.id}>
                Subcategoria de: {c.nome}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-seg-primary text-white px-4 py-2 text-sm font-medium">
            Adicionar
          </button>
        </form>

        {raiz.length === 0 ? (
          <EmptyState title="Nenhuma categoria cadastrada" description="Cadastre a primeira categoria acima." />
        ) : (
          <div className="space-y-2">
            {raiz.map((cat) => {
              const filhas = categorias.filter((c) => c.categoriaPaiId === cat.id)
              return (
                <div key={cat.id} className="rounded-lg border border-black/10 dark:border-white/10 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{cat.nome}</p>
                    <button
                      onClick={() => excluirCategoria(cat.id).catch((err) => setToast({ mensagem: err instanceof Error ? err.message : 'Erro ao excluir.', tipo: 'erro' }))}
                      className="text-xs text-danger hover:underline min-h-[44px] inline-flex items-center"
                    >
                      Excluir
                    </button>
                  </div>
                  {filhas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {filhas.map((f) => (
                        <span
                          key={f.id}
                          className="text-xs rounded-full border border-black/10 dark:border-white/10 px-2.5 py-1 text-black/60 dark:text-white/60"
                        >
                          {f.nome}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3">Marcas</h2>
        <form onSubmit={adicionarMarca} className="flex gap-2 mb-4">
          <input
            value={novaMarca}
            onChange={(e) => setNovaMarca(e.target.value)}
            placeholder="Nome da marca"
            required
            className="flex-1 border border-black/15 dark:border-white/15 rounded-lg px-3 py-2 text-sm bg-transparent"
          />
          <button type="submit" className="rounded-lg bg-seg-primary text-white px-4 py-2 text-sm font-medium">
            Adicionar
          </button>
        </form>
        {marcas.length === 0 ? (
          <EmptyState title="Nenhuma marca cadastrada" description="Cadastre a primeira marca acima." />
        ) : (
          <div className="flex flex-wrap gap-2">
            {marcas.map((m) => (
              <span
                key={m.id}
                className="text-sm rounded-full border border-black/10 dark:border-white/10 px-3 py-1.5 flex items-center gap-2"
              >
                {m.nome}
                <button onClick={() => excluirMarca(m.id).catch((err) => setToast({ mensagem: err instanceof Error ? err.message : 'Erro ao excluir.', tipo: 'erro' }))} className="text-danger text-xs">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
