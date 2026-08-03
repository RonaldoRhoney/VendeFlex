import Footer from '../components/Footer'

export default function TermosUso() {
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 animate-fade-in">
        <h1 className="font-display text-3xl font-semibold mb-4">Termos de Uso</h1>
        <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed">
          Esta página está em construção. O conteúdo completo dos Termos de Uso será publicado junto com o
          lançamento da autenticação e dos planos do VendeFlex.
        </p>
      </main>
      <Footer />
    </div>
  )
}
