import { useState } from 'react'

interface LoginProps {
  onEntrar: () => void
}

// Só visual nesta fase — sem chamada real ao Supabase Auth (login único
// RhoneyInc ainda não foi desenhado, ver Capítulo 3 do PRD). Qualquer
// preenchimento "entra" e cria uma sessão fake em localStorage
// (ver Painel.tsx).
export default function Login({ onEntrar }: LoginProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  function entrar(e: React.FormEvent) {
    e.preventDefault()
    onEntrar()
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 bg-bg-light dark:bg-bg-dark">
      <form onSubmit={entrar} className="w-full max-w-sm animate-fade-in">
        <div className="flex items-center gap-2 justify-center mb-8">
          <span className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white font-bold shrink-0">
            V
          </span>
          <span className="font-display text-xl font-semibold">VendeFlex</span>
        </div>
        <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@negocio.com"
              className="w-full border border-black/15 dark:border-white/15 bg-transparent rounded-lg px-3 py-2.5 text-sm placeholder:text-black/30 dark:placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-black/15 dark:border-white/15 bg-transparent rounded-lg px-3 py-2.5 text-sm placeholder:text-black/30 dark:placeholder:text-white/30"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-brand text-white py-2.5 text-sm font-medium transition-transform active:scale-95 hover:bg-brand-dark"
          >
            Entrar
          </button>
        </div>
        <p className="text-center text-xs text-black/40 dark:text-white/40 mt-4">
          Uma conta. Todos os softwares.
        </p>
      </form>
    </div>
  )
}
