import { useState } from 'react'
import { signInWithGoogle, signInWithPassword, signUpWithPassword } from '../../lib/auth'

const IconeGoogle = () => (
  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5">
    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.89c2.28-2.1 3.57-5.19 3.57-8.84z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.89-3.02c-1.08.72-2.45 1.15-4.04 1.15-3.1 0-5.73-2.1-6.67-4.92H1.3v3.1C3.26 21.3 7.3 24 12 24z" />
    <path fill="#FBBC05" d="M5.33 14.31A7.2 7.2 0 0 1 4.96 12c0-.8.14-1.58.37-2.31V6.6H1.3A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.3 5.4l4.03-3.09z" />
    <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.3 0 3.26 2.7 1.3 6.6l4.03 3.1c.94-2.83 3.57-4.93 6.67-4.93z" />
  </svg>
)

// Autenticação real (Supabase Auth, migration 0001) — toggle Entrar/Criar
// conta. Confirmação de e-mail está ativada no projeto, então "Criar conta"
// não entra direto: mostra uma tela pedindo pra confirmar o e-mail antes do
// primeiro login (o link do e-mail já devolve sessão ativa ao voltar pro
// app, via detectSessionInUrl padrão do supabase-js).
export default function Login() {
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [emailEnviado, setEmailEnviado] = useState(false)
  const [googleCarregando, setGoogleCarregando] = useState(false)

  async function entrarComGoogle() {
    setErro(null)
    setGoogleCarregando(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível continuar com o Google.')
      setGoogleCarregando(false)
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      if (modo === 'entrar') {
        await signInWithPassword(email, senha)
      } else {
        await signUpWithPassword(email, senha)
        setEmailEnviado(true)
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível continuar.')
    } finally {
      setEnviando(false)
    }
  }

  if (emailEnviado) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4 bg-bg-light dark:bg-bg-dark">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <div className="flex items-center gap-2 justify-center mb-6">
            <span className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white font-bold shrink-0">V</span>
            <span className="font-display text-xl font-semibold">VendeFlex</span>
          </div>
          <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6">
            <p className="text-sm font-medium mb-1.5">Verifique seu e-mail</p>
            <p className="text-xs text-black/50 dark:text-white/50">
              Enviamos um link de confirmação pra <strong>{email}</strong>. Clique nele pra ativar sua conta e entrar.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 bg-bg-light dark:bg-bg-dark">
      <form onSubmit={enviar} className="w-full max-w-sm animate-fade-in">
        <div className="flex items-center gap-2 justify-center mb-8">
          <span className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white font-bold shrink-0">V</span>
          <span className="font-display text-xl font-semibold">VendeFlex</span>
        </div>
        <div className="border border-black/10 dark:border-white/10 rounded-2xl p-6 space-y-4">
          <button
            type="button"
            onClick={entrarComGoogle}
            disabled={googleCarregando || enviando}
            className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-black/15 dark:border-white/15 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            <IconeGoogle />
            {googleCarregando ? 'Aguarde...' : 'Continuar com Google'}
          </button>

          <div className="flex items-center gap-3">
            <span className="flex-1 h-px bg-black/10 dark:bg-white/10" />
            <span className="text-xs text-black/40 dark:text-white/40">ou com e-mail</span>
            <span className="flex-1 h-px bg-black/10 dark:bg-white/10" />
          </div>

          <div className="flex rounded-lg border border-black/15 dark:border-white/15 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setModo('entrar')}
              className={`flex-1 rounded-md py-2 min-h-[36px] transition-colors ${modo === 'entrar' ? 'bg-seg-primary text-white' : 'text-black/60 dark:text-white/60'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setModo('criar')}
              className={`flex-1 rounded-md py-2 min-h-[36px] transition-colors ${modo === 'criar' ? 'bg-seg-primary text-white' : 'text-black/60 dark:text-white/60'}`}
            >
              Criar conta
            </button>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@negocio.com"
              required
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
              required
              minLength={6}
              className="w-full border border-black/15 dark:border-white/15 bg-transparent rounded-lg px-3 py-2.5 text-sm placeholder:text-black/30 dark:placeholder:text-white/30"
            />
          </div>
          {erro && <p className="text-xs text-danger">{erro}</p>}
          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-brand text-white py-2.5 text-sm font-medium transition-transform active:scale-95 hover:bg-brand-dark disabled:opacity-50"
          >
            {enviando ? 'Aguarde...' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </div>
        <p className="text-center text-xs text-black/40 dark:text-white/40 mt-4">Uma conta. Todos os softwares.</p>
      </form>
    </div>
  )
}
