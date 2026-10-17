import { Calendar, CheckCircle2, ChefHat, ClipboardList, MapPin, Package, Truck, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { orderService } from '../../services/orderService'
import { Order, OrderStatus } from '../../types'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { LoadingButton } from '../ui/LoadingButton'
import { StatusBadge } from '../ui/StatusBadge'

interface OrderDetailsModalProps {
  orderId: number | null
  onClose: () => void
  onUpdateStatus: (orderId: number, status: OrderStatus) => Promise<Order>
}

const availableStatuses: { value: OrderStatus; label: string }[] = [
  { value: 'RECEBIDO', label: 'Recebido' },
  { value: 'EM_PREPARO', label: 'Em preparo' },
  { value: 'SAIU_PARA_ENTREGA', label: 'Saiu para entrega' },
  { value: 'ENTREGUE', label: 'Entregue' },
  { value: 'CANCELADO', label: 'Cancelado' }
]

const trackingSteps: { key: OrderStatus; label: string; icon: typeof ClipboardList }[] = [
  { key: 'RECEBIDO', label: 'Recebido', icon: ClipboardList },
  { key: 'EM_PREPARO', label: 'Em preparo', icon: ChefHat },
  { key: 'SAIU_PARA_ENTREGA', label: 'Em rota', icon: Truck },
  { key: 'ENTREGUE', label: 'Entregue', icon: CheckCircle2 }
]

export function OrderDetailsModal({
  orderId,
  onClose,
  onUpdateStatus
}: OrderDetailsModalProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('RECEBIDO')
  const [isSavingStatus, setIsSavingStatus] = useState(false)

  useEffect(() => {
    if (orderId === null) {
      setOrder(null)
      return
    }

    let isMounted = true
    setIsLoadingDetails(true)

    orderService
      .getById(orderId)
      .then(data => {
        if (!isMounted) return
        setOrder(data)
        setSelectedStatus(data.status)
      })
      .catch(err => {
        if (!isMounted) return
        toast.error(err instanceof Error ? err.message : 'Erro ao buscar detalhes do pedido.')
        onClose()
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetails(false)
      })

    return () => {
      isMounted = false
    }
  }, [orderId, onClose])

  if (orderId === null) return null

  const isFinalized = order?.status === 'ENTREGUE' || order?.status === 'CANCELADO'
  const currentStepIndex = order
    ? trackingSteps.findIndex(step => step.key === order.status)
    : -1

  const handleSaveStatus = async () => {
    if (!order || selectedStatus === order.status) return
    setIsSavingStatus(true)
    try {
      const updated = await onUpdateStatus(order.id, selectedStatus)
      setOrder(updated)
      setSelectedStatus(updated.status)
    } finally {
      setIsSavingStatus(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-details-title"
    >
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl w-full max-w-lg overflow-hidden animate-modal-enter">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 id="order-details-title" className="text-base font-semibold text-stone-900">
              Rastreamento do Pedido #{orderId}
            </h2>
            {order && <StatusBadge status={order.status} label={order.statusDescription} />}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {isLoadingDetails || !order ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3 text-stone-500 text-sm">
            <div className="h-7 w-7 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
            <span>Buscando pedido #{orderId}...</span>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {order.status !== 'CANCELADO' && (
              <div className="grid grid-cols-4 gap-2 pt-1 pb-2">
                {trackingSteps.map((step, index) => {
                  const Icon = step.icon
                  const isDone = currentStepIndex >= index
                  const isCurrent = currentStepIndex === index
                  return (
                    <div key={step.key} className="flex flex-col items-center text-center">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-orange-600 text-white ring-4 ring-orange-500/20'
                            : isDone
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-stone-100 text-stone-400'
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <span
                        className={`text-[11px] mt-1.5 font-medium ${
                          isDone ? 'text-stone-900' : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-stone-800">
                <User className="h-4 w-4 text-stone-400 shrink-0" aria-hidden="true" />
                <span className="font-semibold text-sm">{order.customerName}</span>
              </div>
              <div className="flex items-start gap-2 text-stone-600">
                <MapPin className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{order.deliveryAddress}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-stone-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  Criado: {formatDateTime(order.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  Atualizado: {formatDateTime(order.updatedAt)}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5 inline-flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" aria-hidden="true" />
                Itens ({order.items.length})
              </h3>
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                    <tr>
                      <th className="text-left font-medium px-3.5 py-2">Item</th>
                      <th className="text-center font-medium px-2 py-2">Qtd</th>
                      <th className="text-right font-medium px-3.5 py-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {order.items.map(item => (
                      <tr key={item.id ?? item.name}>
                        <td className="px-3.5 py-2.5 font-medium text-stone-800">
                          {item.name}
                          <span className="block text-[11px] text-stone-400 font-normal">
                            {formatCurrency(item.unitPrice)} un.
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-center text-stone-700 font-semibold">
                          {item.quantity}x
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-semibold text-stone-900">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-stone-50 border-t border-stone-200">
                    <tr>
                      <td colSpan={2} className="px-3.5 py-2.5 font-semibold text-stone-700">
                        Valor Total do Pedido
                      </td>
                      <td className="px-3.5 py-2.5 text-right text-sm font-bold text-orange-600">
                        {formatCurrency(order.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {!isFinalized ? (
              <div className="pt-2 border-t border-stone-200">
                <label htmlFor="status-select" className="block text-xs font-medium text-stone-700 mb-2">
                  Alterar status manualmente
                </label>
                <div className="flex items-center gap-2">
                  <select
                    id="status-select"
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value as OrderStatus)}
                    className="flex-1 rounded-xl border border-stone-300 px-3 py-2.5 text-xs sm:text-sm text-stone-900 bg-white focus:border-orange-500 focus:outline-none"
                  >
                    {availableStatuses.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <LoadingButton
                    type="button"
                    variant="primary"
                    size="md"
                    disabled={selectedStatus === order.status}
                    isLoading={isSavingStatus}
                    loadingText="Salvando..."
                    onClick={handleSaveStatus}
                  >
                    Atualizar Status
                  </LoadingButton>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-stone-100 px-3.5 py-2.5 text-xs text-stone-600 text-center">
                Este pedido já foi finalizado ({order.statusDescription.toLowerCase()}) e não pode ter o status alterado.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
