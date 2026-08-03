import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import ThemeToggle from '../components/ThemeToggle'

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh">
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 font-semibold">
          <span className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white text-sm shrink-0">V</span>
          VendeFlex
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 animate-fade-in">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight max-w-2xl">
          Gestão comercial e de estoque, do jeito certo pro seu negócio
        </h1>
        <p className="text-base text-black/60 dark:text-white/60 mt-4 max-w-xl">
          Estoque, PDV, compras, financeiro e relatórios num só lugar — com um design que se adapta ao segmento do
          seu negócio. Feito pela RhoneyInc.
        </p>
        <Link
          to="/admin"
          className="mt-8 rounded-xl bg-brand text-white px-6 py-3 text-sm font-medium transition-transform active:scale-95 hover:bg-brand-dark"
        >
          Acessar painel
        </Link>
      </main>

      <Footer />
    </div>
  )
}
