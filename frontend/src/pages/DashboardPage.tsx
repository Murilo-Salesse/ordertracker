import { Inbox, Plus, RefreshCw, Search } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from '../components/layout/Navbar'
import { CreateOrderModal } from '../components/orders/CreateOrderModal'
import { OrderCard } from '../components/orders/OrderCard'
import { OrderDetailsModal } from '../components/orders/OrderDetailsModal'
import { LoadingButton } from '../components/ui/LoadingButton'
import { useOrders } from '../hooks/useOrders'
import { OrderStatus } from '../types'

const filterTabs: { key: OrderStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'RECEBIDO', label: 'Recebidos' },
  { key: 'EM_PREPARO', label: 'Em preparo' },
  { key: 'SAIU_PARA_ENTREGA', label: 'Em rota' },
  { key: 'ENTREGUE', label: 'Entregues' },
  { key: 'CANCELADO', label: 'Cancelados' }
]

export function DashboardPage() {
  const {
    filteredOrders,
    statusCounts,
    isLoading,
    isRefreshing,
    updatingOrderId,
    selectedStatus,
    searchTerm,
    setSelectedStatus,
    setSearchTerm,
    fetchOrders,
    createOrder,
    updateOrderStatus
  } = useOrders()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6" aria-label="Resumo por status">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4">
            <span className="text-xs font-medium text-stone-500">Recebidos</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">{statusCounts.RECEBIDO}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4">
            <span className="text-xs font-medium text-stone-500">Em preparo</span>
            <p className="text-2xl font-bold text-blue-600 mt-1">{statusCounts.EM_PREPARO}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4">
            <span className="text-xs font-medium text-stone-500">Saiu p/ entrega</span>
            <p className="text-2xl font-bold text-purple-600 mt-1">{statusCounts.SAIU_PARA_ENTREGA}</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4">
            <span className="text-xs font-medium text-stone-500">Entregues</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{statusCounts.ENTREGUE}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-stone-200/80 p-4">
            <span className="text-xs font-medium text-stone-500">Cancelados</span>
            <p className="text-2xl font-bold text-red-600 mt-1">{statusCounts.CANCELADO}</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {filterTabs.map(tab => {
              const isActive = selectedStatus === tab.key
              const count = statusCounts[tab.key]
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="h-4 w-4 text-stone-400 absolute left-3 top-2.5" aria-hidden="true" />
              <input
                type="search"
                placeholder="Buscar cliente, endereço ou #ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <LoadingButton
              type="button"
              variant="outline"
              size="sm"
              isLoading={isRefreshing}
              loadingText="Atualizando"
              onClick={() => fetchOrders(true)}
              title="Atualizar lista de pedidos"
              className="py-2"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Atualizar</span>
            </LoadingButton>
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(skeleton => (
              <div
                key={skeleton}
                className="bg-white rounded-2xl border border-stone-200/80 p-5 h-64 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="h-5 w-16 bg-stone-200 rounded-lg" />
                    <div className="h-5 w-24 bg-stone-200 rounded-full" />
                  </div>
                  <div className="h-5 w-40 bg-stone-200 rounded-lg" />
                  <div className="h-4 w-full bg-stone-100 rounded-lg" />
                </div>
                <div className="h-20 bg-stone-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/90 p-12 text-center max-w-md mx-auto my-8">
            <div className="h-12 w-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-3">
              <Inbox className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-base font-semibold text-stone-900">
              Nenhum pedido encontrado
            </h2>
            <p className="text-xs text-stone-500 mt-1 mb-5">
              Não há pedidos correspondentes ao filtro atual ou sua fila ainda está vazia.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Criar primeiro pedido</span>
            </button>
          </div>
        ) : (
          <section
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            aria-label="Lista de pedidos"
          >
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                isUpdating={updatingOrderId === order.id}
                onUpdateStatus={updateOrderStatus}
                onSelectOrder={id => setSelectedOrderId(id)}
              />
            ))}
          </section>
        )}
      </main>

      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateOrder={createOrder}
      />

      <OrderDetailsModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onUpdateStatus={updateOrderStatus}
      />
    </div>
  )
}
