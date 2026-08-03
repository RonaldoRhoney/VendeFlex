// Injeta sob demanda a fonte de um segmento (Google Fonts) — as ~15 fontes
// possíveis (Poppins, Bebas Neue, Montserrat, Nunito, Quicksand, Lora,
// Roboto, Playfair Display, Cormorant Garamond, Oswald, Roboto Condensed,
// Rajdhani...) nunca são todas pré-carregadas no index.html, só a fonte do
// segmento selecionado/pré-visualizado no momento.
const carregadas = new Set<string>()

export function carregarFonteSegmento(fontFamily: string) {
  if (carregadas.has(fontFamily)) return
  carregadas.add(fontFamily)

  const familiaUrl = fontFamily.replace(/ /g, '+')
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${familiaUrl}:wght@400;500;600;700&display=swap`
  document.head.appendChild(link)
}
