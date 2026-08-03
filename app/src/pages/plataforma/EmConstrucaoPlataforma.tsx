import EmptyState from '../../components/EmptyState'

interface EmConstrucaoPlataformaProps {
  area: string
}

// Placeholder pras áreas do Cap. 19.2 marcadas V2/V3 no PRD (Faturamento,
// Uso de IA, Consumo, Tickets, Erros, Deploys) — só "Empresas" (RF-ADM-01)
// é MVP.
export default function EmConstrucaoPlataforma({ area }: EmConstrucaoPlataformaProps) {
  return (
    <EmptyState
      icon={<span className="text-3xl">🚧</span>}
      title={`${area} — V2/V3`}
      description="Requisito não-MVP do Capítulo 19 do PRD — ainda não implementado nesta fase."
    />
  )
}
