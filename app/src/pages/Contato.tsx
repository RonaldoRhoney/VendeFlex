import Footer from '../components/Footer'

export default function Contato() {
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 animate-fade-in">
        <h1 className="font-display text-3xl font-semibold mb-4">Contato</h1>
        <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed">
          Esta página está em construção. Em breve, um canal de contato direto com a equipe RhoneyInc.
        </p>
      </main>
      <Footer />
    </div>
  )
}
