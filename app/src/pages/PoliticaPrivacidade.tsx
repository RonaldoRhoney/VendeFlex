import Footer from '../components/Footer'

export default function PoliticaPrivacidade() {
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 animate-fade-in">
        <h1 className="font-display text-3xl font-semibold mb-4">Política de Privacidade</h1>
        <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed">
          Esta página está em construção. Nesta fase o VendeFlex ainda não coleta nenhum dado de usuário — o conteúdo
          completo (o que é coletado, por quê, como é usado e com quem é compartilhado, incluindo qualquer uso futuro
          de IA de terceiros) será publicado antes do lançamento do backend/autenticação, seguindo a política de
          privacidade obrigatória de todo produto RhoneyInc.
        </p>
      </main>
      <Footer />
    </div>
  )
}
