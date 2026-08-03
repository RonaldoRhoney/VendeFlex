import Footer from '../components/Footer'
import HeaderInstitucional from '../components/HeaderInstitucional'

export default function Contato() {
  return (
    <div className="flex flex-col min-h-dvh">
      <HeaderInstitucional />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 animate-fade-in">
        <h1 className="font-display text-3xl font-semibold mb-4">Contato</h1>
        <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed mb-8">
          O VendeFlex é um produto RhoneyInc. Fale com a gente para dúvidas sobre o sistema, sugestões de segmento,
          parcerias ou qualquer solicitação relacionada aos seus dados (veja também a{' '}
          <a href="/privacidade" className="text-brand hover:underline">Política de Privacidade</a>).
        </p>

        <div className="rounded-2xl border border-black/10 dark:border-white/10 p-5">
          <h2 className="font-display text-sm font-semibold mb-1">E-mail</h2>
          <a href="mailto:rhoneyinc@gmail.com" className="text-brand hover:underline text-sm">
            rhoneyinc@gmail.com
          </a>
          <p className="text-black/50 dark:text-white/50 text-xs mt-2">Respondemos em até 3 dias úteis.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
