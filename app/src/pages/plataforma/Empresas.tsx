import { useState } from 'react'
import { TENANTS_ADMIN_MOCK } from '../../lib/tenantsAdminMock'

const PLANO_LABEL: Record<string, string> = { free: 'Free', basico: 'Básico', premium: 'Premium', enterprise: 'Enterprise' }
const PLANO_CLASSE: Record<string, string> = {
  free: 'text-white/50 border-white/15',
  basico: 'text-accent border-accent/30 bg-accent/10',
  premium: 'text-brand border-brand/30 bg-brand/10',
  enterprise: 'text-success border-success/30 bg-success/10',
}

// Empresas / Tenants (Cap. 19.2, RF-ADM-01 — único requisito MVP deste
// painel: "listagem e busca de tenants com filtro por plano e segmento").
// Demais áreas do Cap. 19.2 (Faturamento, Uso de IA, Tickets, Erros,
// Deploys...) são V2/V3, ver EmConstrucaoPlataforma.tsx.
export default function Empresas() {
  const [busca, setBusca] = useState('')
  const [plano, setPlano] = useState('todos')
  const [segmento, setSegmento] = useState('todos')

  const segmentos = Array.from(new Set(TENANTS_ADMIN_MOCK.map((t) => t.segmento))).sort()

  const visiveis = TENANTS_ADMIN_MOCK.filter((t) => {
    const bateBusca = t.nomeNegocio.toLowerCase().includes(busca.toLowerCase())
    const batePlano = plano === 'todos' || t.plano === plano
    const bateSegmento = segmento === 'todos' || t.segmento === segmento
    return bateBusca && batePlano && bateSegmento
  })

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Empresas</h2>
        <p className="text-xs text-white/40">{visiveis.length} de {TENANTS_ADMIN_MOCK.length} tenants</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome do negócio"
          className="flex-1 min-w-[200px] border border-white/15 bg-transparent rounded-lg px-3 py-2 text-sm placeholder:text-white/30"
        />
        <select value={plano} onChange={(e) => setPlano(e.target.value)} className="border border-white/15 bg-bg-dark rounded-lg px-3 py-2 text-sm">
          <option value="todos">Todos os planos</option>
          <option value="free">Free</option>
          <option value="basico">Básico</option>
          <option value="premium">Premium</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select value={segmento} onChange={(e) => setSegmento(e.target.value)} className="border border-white/15 bg-bg-dark rounded-lg px-3 py-2 text-sm">
          <option value="todos">Todos os segmentos</option>
          {segmentos.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] border-b border-white/10">
            <tr className="text-left text-xs text-white/40">
              <th className="px-3 py-2.5 font-medium">Negócio</th>
              <th className="px-3 py-2.5 font-medium">Segmento</th>
              <th className="px-3 py-2.5 font-medium">Plano</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((t) => (
              <tr key={t.id} className="border-b border-white/5 last:border-0">
                <td className="px-3 py-2.5 font-medium">{t.nomeNegocio}</td>
                <td className="px-3 py-2.5 text-white/60">{t.segmento}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-xs rounded-full border px-2 py-0.5 ${PLANO_CLASSE[t.plano]}`}>{PLANO_LABEL[t.plano]}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`text-xs ${t.status === 'ativo' ? 'text-success' : 'text-white/30'}`}>
                    {t.status === 'ativo' ? '● Ativo' : '○ Inativo'}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-white/40">{new Date(t.criadoEm).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
            {visiveis.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-white/40">
                  Nenhum tenant encontrado com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
