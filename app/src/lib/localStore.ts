import { useEffect, useState } from 'react'

// Fábrica de "store" local — mesmo padrão já usado em vendasStore.ts,
// generalizado pra não duplicar a lógica de ler/salvar/sincronizar em cada
// entidade nova (produtos, categorias, fornecedores, compras...). Ainda é
// só localStorage (sem backend nesta fase) — a chave existe pra virar
// tabela real (e este arquivo, pro hook de fetch real) quando o schema for
// desenhado.
export function createLocalStore<T>(chave: string, seed: T[]) {
  const evento = `vendeflex-${chave}-mudou`

  function ler(): T[] {
    try {
      const raw = localStorage.getItem(chave)
      if (raw) return JSON.parse(raw) as T[]
      localStorage.setItem(chave, JSON.stringify(seed))
      return seed
    } catch {
      return seed
    }
  }

  function salvar(itens: T[]) {
    localStorage.setItem(chave, JSON.stringify(itens))
    window.dispatchEvent(new Event(evento))
  }

  // Nome precisa começar com "use" — é um Hook de verdade (chama
  // useState/useEffect), e o oxlint (regra rules-of-hooks) exige a
  // convenção de nome pra reconhecer isso.
  function useStore(): T[] {
    const [itens, setItens] = useState<T[]>(ler)
    useEffect(() => {
      function atualizar() {
        setItens(ler())
      }
      window.addEventListener(evento, atualizar)
      window.addEventListener('storage', atualizar)
      return () => {
        window.removeEventListener(evento, atualizar)
        window.removeEventListener('storage', atualizar)
      }
    }, [])
    return itens
  }

  return { ler, salvar, useStore }
}
