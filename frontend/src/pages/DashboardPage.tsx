import { ArrowUpDown, Inbox, LayoutGrid, List, Plus, RefreshCw, Search } from 'lucide-react'
import { useState } from 'react'
import { Navbar } from '../components/layout/Navbar'
import { CreateOrderModal } from '../components/orders/CreateOrderModal'
import { OrderCard } from '../components/orders/OrderCard'
import { OrderDetailsModal } from '../components/orders/OrderDetailsModal'
import { OrderListTable } from '../components/orders/OrderListTable'
import { OrderMapModal } from '../components/orders/OrderMapModal'
import { LoadingButton } from '../components/ui/LoadingButton'
import { OrderSortOption, useOrders } from '../hooks/useOrders'
import { Order, OrderStatus } from '../types'

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
    refreshCycle,
    updatingOrderId,
    selectedStatus,
    sortBy,
    searchTerm,
    setSelectedStatus,
    setSortBy,
    setSearchTerm,
    fetchOrders,
    createOrder,
    updateOrderStatus
  } = useOrders()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [mapOrder, setMapOrder] = useState<Order | null>(null)

  const handleCardFilterToggle = (status: OrderStatus) => {
    setSelectedStatus(prev => (prev === status ? 'ALL' : status))
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <section
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6 animate-fade-up"
          aria-label="Resumo por status"
        >
          <button
            type="button"
            onClick={() => handleCardFilterToggle('RECEBIDO')}
            className={`text-left bg-white rounded-2xl border p-4 transition-all cursor-pointer ${
              selectedStatus === 'RECEBIDO'
                ? 'border-amber-500 ring-2 ring-amber-500/15'
                : 'border-stone-200/80 hover:border-amber-300'
            }`}
          >
            <span className="text-xs font-medium text-stone-500">Recebidos</span>
            <p className="text-2xl font-bold text-amber-600 mt-1">{statusCounts.RECEBIDO}</p>
          </button>

          <button
            type="button"
            onClick={() => handleCardFilterToggle('EM_PREPARO')}
            className={`text-left bg-white rounded-2xl border p-4 transition-all cursor-pointer ${
              selectedStatus === 'EM_PREPARO'
                ? 'border-blue-500 ring-2 ring-blue-500/15'
                : 'border-stone-200/80 hover:border-blue-300'
            }`}
          >
            <span className="text-xs font-medium text-stone-500">Em preparo</span>
            <p className="text-2xl font-bold text-blue-600 mt-1">{statusCounts.EM_PREPARO}</p>
          </button>

          <button
            type="button"
            onClick={() => handleCardFilterToggle('SAIU_PARA_ENTREGA')}
            className={`text-left bg-white rounded-2xl border p-4 transition-all cursor-pointer ${
              selectedStatus === 'SAIU_PARA_ENTREGA'
                ? 'border-purple-500 ring-2 ring-purple-500/15'
                : 'border-stone-200/80 hover:border-purple-300'
            }`}
          >
            <span className="text-xs font-medium text-stone-500">Saiu p/ entrega</span>
            <p className="text-2xl font-bold text-purple-600 mt-1">{statusCounts.SAIU_PARA_ENTREGA}</p>
          </button>

          <button
            type="button"
            onClick={() => handleCardFilterToggle('ENTREGUE')}
            className={`text-left bg-white rounded-2xl border p-4 transition-all cursor-pointer ${
              selectedStatus === 'ENTREGUE'
                ? 'border-emerald-500 ring-2 ring-emerald-500/15'
                : 'border-stone-200/80 hover:border-emerald-300'
            }`}
          >
            <span className="text-xs font-medium text-stone-500">Entregues</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{statusCounts.ENTREGUE}</p>
          </button>

          <button
            type="button"
            onClick={() => handleCardFilterToggle('CANCELADO')}
            className={`col-span-2 sm:col-span-1 text-left bg-white rounded-2xl border p-4 transition-all cursor-pointer ${
              selectedStatus === 'CANCELADO'
                ? 'border-red-500 ring-2 ring-red-500/15'
                : 'border-stone-200/80 hover:border-red-300'
            }`}
          >
            <span className="text-xs font-medium text-stone-500">Cancelados</span>
            <p className="text-2xl font-bold text-red-600 mt-1">{statusCounts.CANCELADO}</p>
          </button>
        </section>

        <section
          style={{ animationDelay: '60ms' }}
          className="animate-fade-up bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
            {filterTabs.map(tab => {
              const isActive = selectedStatus === tab.key
              const count = statusCounts[tab.key]
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-2xs'
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

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px] sm:w-56">
              <Search className="h-4 w-4 text-stone-400 absolute left-3 top-2.5" aria-hidden="true" />
              <input
                type="search"
                placeholder="Buscar cliente, endereço ou #ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="relative shrink-0">
              <ArrowUpDown className="h-3.5 w-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" aria-hidden="true" />
              <select
                aria-label="Ordenar pedidos"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as OrderSortOption)}
                className="rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100/70 pl-8 pr-3 py-2 text-xs font-medium text-stone-700 focus:bg-white focus:border-orange-500 focus:outline-none cursor-pointer"
              >
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigos (Fila)</option>
                <option value="highest_value">Maior valor</option>
              </select>
            </div>

            <div
              className="inline-flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200/70 shrink-0"
              role="group"
              aria-label="Modo de visualização"
            >
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Visualização em blocos"
                aria-label="Visualização em blocos"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="Visualização em lista"
                aria-label="Visualização em lista"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <List className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <LoadingButton
              type="button"
              variant="outline"
              size="sm"
              isLoading={isRefreshing}
              loadingText="Sincronizando..."
              onClick={() => fetchOrders(true)}
              title="Atualizar lista de pedidos"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
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
          <div className="animate-fade-up bg-white rounded-2xl border border-stone-200/90 p-12 text-center max-w-md mx-auto my-8">
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
        ) : viewMode === 'list' ? (
          <div
            key={`list-${refreshCycle}-${selectedStatus}-${sortBy}`}
            className={`transition-opacity duration-200 ${isRefreshing ? 'opacity-60' : 'opacity-100'}`}
          >
            <OrderListTable
              orders={filteredOrders}
              updatingOrderId={updatingOrderId}
              onUpdateStatus={updateOrderStatus}
              onSelectOrder={id => setSelectedOrderId(id)}
              onOpenMap={order => setMapOrder(order)}
            />
          </div>
        ) : (
          <section
            key={`grid-${refreshCycle}-${selectedStatus}-${sortBy}`}
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-200 ${
              isRefreshing ? 'opacity-60' : 'opacity-100'
            }`}
            aria-label="Lista de pedidos"
          >
            {filteredOrders.map((order, idx) => (
              <OrderCard
                key={order.id}
                index={idx}
                order={order}
                isUpdating={updatingOrderId === order.id}
                onUpdateStatus={updateOrderStatus}
                onSelectOrder={id => setSelectedOrderId(id)}
                onOpenMap={target => setMapOrder(target)}
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

      <OrderMapModal
        order={mapOrder}
        onClose={() => setMapOrder(null)}
      />
    </div>
  )
}
