import { createClient } from '@supabase/supabase-js'

// Cliente inerte nesta fase — sem tabelas/schema ainda (só frontend, ver
// plano "VendeFlex — Scaffold inicial do frontend"). Mesma estrutura de
// degradação graciosa já usada no MenuFlex: sem envs configuradas, DB_READY
// fica false e todo código consumidor deve checar `supabase` antes de usar.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const DB_READY = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = DB_READY ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string) : null
