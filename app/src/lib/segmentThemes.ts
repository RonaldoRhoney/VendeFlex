// ============================================================
// VENDEFLEX — TEMAS POR SEGMENTO ("Design Inteligente")
//
// Núcleo do prompt "Design Inteligente por Segmento": ao selecionar/mudar o
// segmento do negócio, o sistema sugere automaticamente um tema visual
// (cor + fonte) compatível — o lojista pode aceitar, personalizar ou
// restaurar depois (Capítulo 5 do PRD).
//
// Fonte dos dados: união de duas listas que não coincidem totalmente —
//   1) Capítulo 5.2 do PRD (8 segmentos MVP do VendeFlex: Loja de roupas,
//      Papelaria, Farmácia, Autopeças, Cosméticos, Mercadinho, Açougue, Pet
//      Shop) — só esses aparecem no seletor do Onboarding nesta fase
//      (`mvp: true`).
//   2) O prompt "Design Inteligente" define paleta+fonte pra 15 segmentos,
//      dos quais só 4 coincidem com o MVP (Loja de roupas, Papelaria,
//      Farmácia, Pet Shop) — os outros 11 são majoritariamente do domínio
//      do MenuFlex (Restaurante, Hamburgueria, Pizzaria, Açaiteria,
//      Sorveteria, Padaria) ou de segmentos de serviço (Salão de beleza,
//      Barbearia) que também não são MVP aqui. Ficam no código como
//      `mvp: false`, prontos pra V2/V3 ou reuso futuro, mas ocultos da UI.
//
// IMPORTANTE: nenhum hex de cor abaixo veio pronto do documento-fonte — o
// prompt só descreve nomes de cor ("Roxo, lilás, branco"), nunca valores
// hexadecimais. Todo hex aqui é uma primeira aproximação de designer a
// partir desses nomes, e deve ser confirmado/ajustado antes de considerar
// "final". Os 4 segmentos MVP sem paleta nenhuma no prompt (Autopeças,
// Cosméticos, Mercadinho, Açougue) foram EXTRAPOLADOS por analogia a um
// segmento correlato do próprio prompt (`extrapolated: true`) — pendência
// de design mais explícita ainda.
// ============================================================

export interface SegmentTheme {
  id: string
  label: string
  mvp: boolean
  colors: { primary: string; secondary: string; tertiary: string }
  fontDisplay: string
  fontBody?: string
  extrapolated?: boolean
}

export const SEGMENT_THEMES: SegmentTheme[] = [
  // ---------- 8 segmentos MVP (PRD Capítulo 5.2) ----------
  {
    id: 'loja-de-roupas',
    label: 'Loja de roupas',
    mvp: true,
    colors: { primary: '#141414', secondary: '#FFFFFF', tertiary: '#8C8C8C' },
    fontDisplay: 'Playfair Display',
    fontBody: 'Inter',
  },
  {
    id: 'papelaria',
    label: 'Papelaria',
    mvp: true,
    colors: { primary: '#2FB6A6', secondary: '#F2C230', tertiary: '#FFFFFF' },
    fontDisplay: 'Poppins',
  },
  {
    id: 'farmacia',
    label: 'Farmácia',
    mvp: true,
    colors: { primary: '#2E6F9E', secondary: '#FFFFFF', tertiary: '#2E9E5B' },
    fontDisplay: 'Inter',
  },
  {
    id: 'pet-shop',
    label: 'Pet Shop',
    mvp: true,
    colors: { primary: '#7FC1E0', secondary: '#F0923A', tertiary: '#FFFFFF' },
    fontDisplay: 'Nunito',
  },
  {
    id: 'autopecas',
    label: 'Autopeças',
    mvp: true,
    extrapolated: true, // espelha "Oficina", sem paleta própria no prompt
    colors: { primary: '#2B2B2B', secondary: '#C0392B', tertiary: '#B0B3B8' },
    fontDisplay: 'Rajdhani',
  },
  {
    id: 'cosmeticos',
    label: 'Cosméticos',
    mvp: true,
    extrapolated: true, // espelha "Salão de beleza"
    colors: { primary: '#B76E79', secondary: '#FFFFFF', tertiary: '#E5E1DF' },
    fontDisplay: 'Cormorant Garamond',
  },
  {
    id: 'mercadinho',
    label: 'Mercadinho',
    mvp: true,
    extrapolated: true, // espelha "Mercado"
    colors: { primary: '#1B3A57', secondary: '#E8752D', tertiary: '#FFFFFF' },
    fontDisplay: 'Roboto',
  },
  {
    id: 'acougue',
    label: 'Açougue',
    mvp: true,
    extrapolated: true, // paleta própria (vermelho carne/preto), sem análogo direto no prompt
    colors: { primary: '#C0392B', secondary: '#FFFFFF', tertiary: '#2B2B2B' },
    fontDisplay: 'Roboto Condensed',
  },

  // ---------- 11 segmentos do prompt fora do MVP do VendeFlex ----------
  {
    id: 'restaurante',
    label: 'Restaurante',
    mvp: false,
    colors: { primary: '#1F4D3E', secondary: '#C1602A', tertiary: '#F5EBDD' },
    fontDisplay: 'Poppins',
  },
  {
    id: 'hamburgueria',
    label: 'Hamburgueria',
    mvp: false,
    colors: { primary: '#16130F', secondary: '#F2C230', tertiary: '#B23A24' },
    fontDisplay: 'Bebas Neue',
    fontBody: 'Inter',
  },
  {
    id: 'pizzaria',
    label: 'Pizzaria',
    mvp: false,
    colors: { primary: '#6B1E2B', secondary: '#6B7A3A', tertiary: '#F3ECDD' },
    fontDisplay: 'Montserrat',
  },
  {
    id: 'acaiteria',
    label: 'Açaiteria',
    mvp: false,
    colors: { primary: '#6C3FA0', secondary: '#B79FD1', tertiary: '#FFFFFF' },
    fontDisplay: 'Nunito',
  },
  {
    id: 'sorveteria',
    label: 'Sorveteria',
    mvp: false,
    colors: { primary: '#A9D6E5', secondary: '#F2A6C1', tertiary: '#FFFFFF' },
    fontDisplay: 'Quicksand',
  },
  {
    id: 'padaria',
    label: 'Padaria',
    mvp: false,
    colors: { primary: '#6B4A2F', secondary: '#E4D3B6', tertiary: '#D4A94C' },
    fontDisplay: 'Lora',
  },
  {
    id: 'mercado',
    label: 'Mercado',
    mvp: false,
    colors: { primary: '#1B3A57', secondary: '#E8752D', tertiary: '#FFFFFF' },
    fontDisplay: 'Roboto',
  },
  {
    id: 'salao-de-beleza',
    label: 'Salão de beleza',
    mvp: false,
    colors: { primary: '#B76E79', secondary: '#FFFFFF', tertiary: '#E5E1DF' },
    fontDisplay: 'Cormorant Garamond',
  },
  {
    id: 'barbearia',
    label: 'Barbearia',
    mvp: false,
    colors: { primary: '#141414', secondary: '#B8860B', tertiary: '#2B2B2B' },
    fontDisplay: 'Oswald',
  },
  {
    id: 'material-de-construcao',
    label: 'Material de Construção',
    mvp: false,
    colors: { primary: '#1F5C63', secondary: '#8C8C8C', tertiary: '#E8752D' },
    fontDisplay: 'Roboto Condensed',
  },
  {
    id: 'oficina',
    label: 'Oficina',
    mvp: false,
    colors: { primary: '#2B2B2B', secondary: '#C0392B', tertiary: '#B0B3B8' },
    fontDisplay: 'Rajdhani',
  },
]

export const MVP_SEGMENTS = SEGMENT_THEMES.filter((s) => s.mvp)

export function findSegmentTheme(id: string | null): SegmentTheme | null {
  if (!id) return null
  return SEGMENT_THEMES.find((s) => s.id === id) ?? null
}
