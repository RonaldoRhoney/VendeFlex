import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

// Chrome persistente (logo + volta pra Home + ThemeToggle) que a Home já
// tem — as páginas institucionais (Privacidade/Termos/Contato) não
// replicavam esse header, então quem chegava direto numa dessas rotas
// ficava sem forma de voltar nem de trocar o tema (achado da auditoria de
// UX/Design System).
export default function HeaderInstitucional() {
  return (
    <header className="px-4 sm:px-8 py-4 flex items-center justify-between max-w-2xl mx-auto w-full">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <span className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white text-sm shrink-0">V</span>
        VendeFlex
      </Link>
      <ThemeToggle />
    </header>
  )
}
