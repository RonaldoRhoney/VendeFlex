import { CATEGORIAS_MOCK, MARCAS_MOCK } from '../../lib/mockData'

// Categorias e Marcas (Capítulo 7.3 do PRD) — árvore de categorias
// pré-populada por segmento no onboarding real (Cap. 5); aqui só a
// listagem, dados mockados.
export default function Categorias() {
  const raiz = CATEGORIAS_MOCK.filter((c) => !c.categoriaPaiId)

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="font-semibold text-lg mb-3">Categorias</h2>
        <div className="space-y-2">
          {raiz.map((cat) => {
            const filhas = CATEGORIAS_MOCK.filter((c) => c.categoriaPaiId === cat.id)
            return (
              <div key={cat.id} className="rounded-lg border border-black/10 dark:border-white/10 p-3">
                <p className="text-sm font-medium">{cat.nome}</p>
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
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3">Marcas</h2>
        <div className="flex flex-wrap gap-2">
          {MARCAS_MOCK.map((m) => (
            <span
              key={m.id}
              className="text-sm rounded-full border border-black/10 dark:border-white/10 px-3 py-1.5"
            >
              {m.nome}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
