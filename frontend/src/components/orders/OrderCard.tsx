import { ArrowRight, Clock, Eye, MapPin, User, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Order, OrderStatus } from '../../types'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { LoadingButton } from '../ui/LoadingButton'
import { StatusBadge } from '../ui/StatusBadge'

interface OrderCardProps {
  order: Order
  isUpdating: boolean
  onUpdateStatus: (orderId: number, nextStatus: OrderStatus) => Promise<unknown>
  onSelectOrder: (orderId: number) => void
}

const nextStatusFlow: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  RECEBIDO: { next: 'EM_PREPARO', label: 'Iniciar preparo' },
  EM_PREPARO: { next: 'SAIU_PARA_ENTREGA', label: 'Despachar entrega' },
  SAIU_PARA_ENTREGA: { next: 'ENTREGUE', label: 'Confirmar entrega' }
}

const progressSteps: OrderStatus[] = ['RECEBIDO', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE']

export function OrderCard({
  order,
  isUpdating,
  onUpdateStatus,
  onSelectOrder
}: OrderCardProps) {
  const [pendingTargetStatus, setPendingTargetStatus] = useState<OrderStatus | null>(null)
  const transition = nextStatusFlow[order.status]
  const isFinalized = order.status === 'ENTREGUE' || order.status === 'CANCELADO'
  const currentStepIndex = progressSteps.indexOf(order.status)

  const handleTransition = async (targetStatus: OrderStatus) => {
    setPendingTargetStatus(targetStatus)
    try {
      await onUpdateStatus(order.id, targetStatus)
    } finally {
      setPendingTargetStatus(null)
    }
  }

  return (
    <article className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-stone-300 transition-all duration-200 flex flex-col justify-between p-5">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700">
              #{order.id}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-stone-500">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDateTime(order.createdAt)}
            </span>
          </div>
          <StatusBadge status={order.status} label={order.statusDescription} />
        </div>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-base">
            <User className="h-4 w-4 text-stone-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{order.customerName}</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-stone-600">
            <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span className="line-clamp-2 leading-relaxed">{order.deliveryAddress}</span>
          </div>
        </div>

        {order.status !== 'CANCELADO' && (
          <div className="mb-4" aria-label="Progresso do pedido">
            <div className="grid grid-cols-4 gap-1.5">
              {progressSteps.map((step, index) => {
                const isCompleted = currentStepIndex >= index
                return (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-colors duration-300 ${
                      isCompleted ? 'bg-orange-500' : 'bg-stone-200'
                    }`}
                  />
                )
              })}
            </div>
          </div>
        )}

        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60 mb-4">
          <div className="text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-2">
            Itens do pedido ({order.items.length})
          </div>
          <ul className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {order.items.map(item => (
              <li key={item.id ?? item.name} className="flex items-center justify-between text-xs text-stone-700 gap-2">
                <span className="truncate">
                  <strong className="font-semibold text-stone-900">{item.quantity}x</strong> {item.name}
                </span>
                <span className="text-stone-500 shrink-0 font-medium">
                  {formatCurrency(item.subtotal)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2.5 pt-2 border-t border-stone-200/80 flex items-center justify-between">
            <span className="text-xs font-medium text-stone-600">Total</span>
            <span className="text-sm font-bold text-stone-900">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelectOrder(order.id)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 px-2.5 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Detalhes</span>
        </button>

        {!isFinalized && (
          <div className="flex items-center gap-1.5 ml-auto">
            <LoadingButton
              type="button"
              variant="danger"
              size="sm"
              disabled={isUpdating}
              isLoading={isUpdating && pendingTargetStatus === 'CANCELADO'}
              loadingText="Cancelando"
              onClick={() => handleTransition('CANCELADO')}
              title="Cancelar pedido"
            >
              <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Cancelar</span>
            </LoadingButton>

            {transition && (
              <LoadingButton
                type="button"
                variant="primary"
                size="sm"
                disabled={isUpdating}
                isLoading={isUpdating && pendingTargetStatus === transition.next}
                loadingText="Atualizando..."
                onClick={() => handleTransition(transition.next)}
              >
                <span>{transition.label}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </LoadingButton>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
