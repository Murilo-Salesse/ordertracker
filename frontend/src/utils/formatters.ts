export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatDateTime(isoString: string): string {
  if (!isoString) return '-'
  const normalized = isoString.includes('T') ? isoString : isoString.replace(' ', 'T')
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return isoString

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
