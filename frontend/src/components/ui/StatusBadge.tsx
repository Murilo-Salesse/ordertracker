import { OrderStatus } from '../../types'

interface StatusBadgeProps {
  status: OrderStatus
  label?: string
}

const statusConfig: Record<
  OrderStatus,
  { bg: string; text: string; dot: string; defaultLabel: string }
> = {
  RECEBIDO: {
    bg: 'bg-amber-50 border-amber-200/80',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    defaultLabel: 'Recebido'
  },
  EM_PREPARO: {
    bg: 'bg-blue-50 border-blue-200/80',
    text: 'text-blue-800',
    dot: 'bg-blue-500 animate-pulse',
    defaultLabel: 'Em preparo'
  },
  SAIU_PARA_ENTREGA: {
    bg: 'bg-purple-50 border-purple-200/80',
    text: 'text-purple-800',
    dot: 'bg-purple-500 animate-pulse',
    defaultLabel: 'Saiu para entrega'
  },
  ENTREGUE: {
    bg: 'bg-emerald-50 border-emerald-200/80',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
    defaultLabel: 'Entregue'
  },
  CANCELADO: {
    bg: 'bg-red-50 border-red-200/80',
    text: 'text-red-700',
    dot: 'bg-red-500',
    defaultLabel: 'Cancelado'
  }
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const style = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {label || style.defaultLabel}
    </span>
  )
}
