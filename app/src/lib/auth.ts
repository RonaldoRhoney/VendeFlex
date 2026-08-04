import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'
import { limparTenantAtual } from './tenant'

// Mesmo padrão do MenuFlex (lib/auth.ts) — sem Context de auth, só um hook
// simples em cima de supabase.auth.getSession()/onAuthStateChange.
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  return { session, loading }
}

export async function signInWithPassword(email: string, senha: string) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) throw error
}

export async function signUpWithPassword(email: string, senha: string) {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.auth.signUp({ email, password: senha })
  if (error) throw error
}

// Login social — Google já verifica o e-mail, então não passa pela etapa
// "verifique seu e-mail" do fluxo por senha; volta pro /admin já com sessão
// ativa (redirectTo), mesmo padrão já usado no MenuFlex.
export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase não configurado')
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/admin` },
  })
  if (error) throw error
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
  limparTenantAtual()
}
