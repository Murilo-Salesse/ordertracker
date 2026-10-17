import { ArrowRight, Eye, MapPin, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Order, OrderStatus } from '../../types'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { LoadingButton } from '../ui/LoadingButton'
import { StatusBadge } from '../ui/StatusBadge'

interface OrderListTableProps {
  orders: Order[]
  updatingOrderId: number | null
  onUpdateStatus: (orderId: number, nextStatus: OrderStatus) => Promise<unknown>
  onSelectOrder: (orderId: number) => void
  onOpenMap: (order: Order) => void
}

const nextStatusFlow: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  RECEBIDO: { next: 'EM_PREPARO', label: 'Iniciar preparo' },
  EM_PREPARO: { next: 'SAIU_PARA_ENTREGA', label: 'Despachar entrega' },
  SAIU_PARA_ENTREGA: { next: 'ENTREGUE', label: 'Confirmar entrega' }
}

export function OrderListTable({
  orders,
  updatingOrderId,
  onUpdateStatus,
  onSelectOrder,
  onOpenMap
}: OrderListTableProps) {
  const [pendingTarget, setPendingTarget] = useState<{
    orderId: number
    status: OrderStatus
  } | null>(null)

  const handleTransition = async (orderId: number, targetStatus: OrderStatus) => {
    setPendingTarget({ orderId, status: targetStatus })
    try {
      await onUpdateStatus(orderId, targetStatus)
    } finally {
      setPendingTarget(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden animate-fade-up">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              <th className="py-3.5 px-4">Pedido</th>
              <th className="py-3.5 px-4">Cliente & Endereço</th>
              <th className="py-3.5 px-4">Itens</th>
              <th className="py-3.5 px-4">Total</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-xs">
            {orders.map(order => {
              const isUpdating = updatingOrderId === order.id
              const transition = nextStatusFlow[order.status]
              const isFinalized = order.status === 'ENTREGUE' || order.status === 'CANCELADO'

              return (
                <tr
                  key={order.id}
                  className="hover:bg-stone-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-semibold px-2 py-1 rounded-lg bg-stone-100 text-stone-800">
                      #{order.id}
                    </span>
                    <span className="block text-[11px] text-stone-400 mt-1">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-semibold text-stone-900 text-sm truncate">
                      {order.customerName}
                    </p>
                    <p className="text-stone-500 truncate mt-0.5">
                      {order.deliveryAddress}
                    </p>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-stone-700 truncate">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                    <span className="text-[11px] text-stone-400">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-bold text-stone-900 text-sm">
                    {formatCurrency(order.totalAmount)}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={order.status} label={order.statusDescription} />
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectOrder(order.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Ver detalhes do pedido"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Detalhes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenMap(order)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-orange-600 hover:bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Ver endereço no mapa"
                      >
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Mapa</span>
                      </button>

                      {!isFinalized && (
                        <>
                          <LoadingButton
                            type="button"
                            variant="danger"
                            size="sm"
                            disabled={isUpdating}
                            isLoading={
                              isUpdating &&
                              pendingTarget?.orderId === order.id &&
                              pendingTarget?.status === 'CANCELADO'
                            }
                            loadingText="Cancelando"
                            onClick={() => handleTransition(order.id, 'CANCELADO')}
                          >
                            <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>Cancelar</span>
                          </LoadingButton>

                          {transition && (
                            <LoadingButton
                              type="button"
                              variant="primary"
                              size="sm"
                              disabled={isUpdating}
                              isLoading={
                                isUpdating &&
                                pendingTarget?.orderId === order.id &&
                                pendingTarget?.status === transition.next
                              }
                              loadingText="Atualizando..."
                              onClick={() => handleTransition(order.id, transition.next)}
                            >
                              <span>{transition.label}</span>
                              <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            </LoadingButton>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
