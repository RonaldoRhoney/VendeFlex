import { useEffect, useState } from 'react'
import { findSegmentTheme } from './segmentThemes'
import { carregarFonteSegmento } from './fontLoader'

const CHAVE_STORAGE = 'vendeflex.segment'

// Hook de live-preview + persistência do tema por segmento (Cap. 5 do PRD +
// prompt "Design Inteligente"). `selecionarSegmento` só troca o preview em
// tempo real (usado no Onboarding, enquanto o lojista testa cada opção);
// `confirmarSegmento` persiste em localStorage — sem backend ainda nesta
// fase.
export function useSegmentTheme() {
  const [segmentId, setSegmentIdState] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : localStorage.getItem(CHAVE_STORAGE),
  )

  useEffect(() => {
    aplicarTema(segmentId)
  }, [segmentId])

  function aplicarTema(id: string | null) {
    const tema = findSegmentTheme(id)
    const root = document.documentElement
    if (!tema) {
      root.style.removeProperty('--seg-primary')
      root.style.removeProperty('--seg-secondary')
      root.style.removeProperty('--seg-font-display')
      return
    }
    root.style.setProperty('--seg-primary', tema.colors.primary)
    root.style.setProperty('--seg-secondary', tema.colors.secondary)
    root.style.setProperty('--seg-font-display', `'${tema.fontDisplay}', ui-serif, Georgia, serif`)
    carregarFonteSegmento(tema.fontDisplay)
    if (tema.fontBody) carregarFonteSegmento(tema.fontBody)
  }

  function selecionarSegmento(id: string | null) {
    setSegmentIdState(id)
  }

  function confirmarSegmento(id: string) {
    localStorage.setItem(CHAVE_STORAGE, id)
    setSegmentIdState(id)
  }

  function restaurarTemaPadrao() {
    localStorage.removeItem(CHAVE_STORAGE)
    setSegmentIdState(null)
  }

  return { segmentId, selecionarSegmento, confirmarSegmento, restaurarTemaPadrao }
}
