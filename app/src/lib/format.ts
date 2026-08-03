export function formatarReais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatarPercentual(valor: number): string {
  const sinal = valor > 0 ? '+' : ''
  return `${sinal}${valor.toFixed(1)}%`
}
