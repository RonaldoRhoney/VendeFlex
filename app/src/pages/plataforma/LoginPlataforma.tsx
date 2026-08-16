import { useState } from 'react'
import { signInWithGoogle, signInWithPassword } from '../../lib/auth'

// Painel Administrativo RhoneyInc (Cap. 19 do PRD) — "nunca é acessível a
// tenants comuns, é restrito a usuários com papel administrativo interno
// (is_admin())". Login real via Supabase Auth — PainelPlataforma.tsx checa
// profiles.is_platform_admin depois da sessão abrir (nunca confia só em
// "logou", precisa ser platform admin de verdade).
export default function LoginPlataforma() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await signInWithPassword(email, senha)
    } catch {
      setErro('E-mail ou senha incorretos.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 bg-bg-dark text-text-dark">
      <form onSubmit={entrar} className="w-full max-w-sm animate-fade-in">
        <div className="flex items-center gap-2 justify-center mb-2">
          <span className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white font-bold shrink-0">
            R
          </span>
          <span className="font-display text-xl font-semibold">RhoneyInc</span>
        </div>
        <p className="text-center text-xs text-white/40 mb-8">Painel Administrativo — acesso restrito à equipe RhoneyInc</p>
        <div className="border border-white/10 rounded-2xl p-6 space-y-4 bg-white/[0.02]">
          <div>
            <label className="text-sm font-medium block mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rhoneyinc@gmail.com"
              className="w-full border border-white/15 bg-transparent rounded-lg px-3 py-2.5 text-sm placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-white/15 bg-transparent rounded-lg px-3 py-2.5 text-sm placeholder:text-white/30"
            />
          </div>
          {erro && <p className="text-xs text-red-400">{erro}</p>}
          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-brand text-white py-2.5 text-sm font-medium transition-transform active:scale-95 hover:bg-brand-dark disabled:opacity-40"
          >
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="w-full rounded-lg border border-white/15 py-2.5 text-sm font-medium hover:bg-white/5"
          >
            Entrar com Google
          </button>
        </div>
      </form>
    </div>
  )
}
