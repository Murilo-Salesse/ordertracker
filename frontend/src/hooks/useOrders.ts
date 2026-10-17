import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { orderService } from '../services/orderService'
import { CreateOrderPayload, Order, OrderStatus } from '../types'

export type OrderSortOption = 'newest' | 'oldest' | 'highest_value'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshCycle, setRefreshCycle] = useState(0)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL')
  const [sortBy, setSortBy] = useState<OrderSortOption>('newest')
  const [searchTerm, setSearchTerm] = useState('')
  const hasFetchedInitialRef = useRef(false)

  const fetchOrders = useCallback(async (manualRefresh = false) => {
    try {
      if (manualRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const [data] = await Promise.all([
        orderService.getAll(),
        manualRefresh ? new Promise(resolve => setTimeout(resolve, 450)) : Promise.resolve()
      ])

      setOrders(data)
      if (manualRefresh) {
        setRefreshCycle(prev => prev + 1)
        toast.success('Painel de pedidos atualizado!')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar pedidos.'
      toast.error(message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (hasFetchedInitialRef.current) return
    hasFetchedInitialRef.current = true
    fetchOrders(false)
  }, [fetchOrders])

  const createOrder = useCallback(async (payload: CreateOrderPayload) => {
    const created = await orderService.create(payload)
    setOrders(prev => [created, ...prev])
    toast.success(`Pedido #${created.id} criado com sucesso!`)
    return created
  }, [])

  const updateOrderStatus = useCallback(async (orderId: number, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId)
    try {
      const updated = await orderService.updateStatus(orderId, nextStatus)
      setOrders(prev => prev.map(item => (item.id === orderId ? updated : item)))
      toast.success(`Pedido #${orderId} atualizado para ${updated.statusDescription}.`)
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível atualizar o status.'
      toast.error(message)
      throw err
    } finally {
      setUpdatingOrderId(null)
    }
  }, [])

  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatus | 'ALL', number> = {
      ALL: orders.length,
      RECEBIDO: 0,
      EM_PREPARO: 0,
      SAIU_PARA_ENTREGA: 0,
      ENTREGUE: 0,
      CANCELADO: 0
    }
    for (const order of orders) {
      counts[order.status] = (counts[order.status] || 0) + 1
    }
    return counts
  }, [orders])

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase()
    const filtered = orders.filter(order => {
      const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus
      if (!matchesStatus) return false
      if (!normalizedQuery) return true

      const matchesId = String(order.id).includes(normalizedQuery.replace('#', ''))
      const matchesCustomer = order.customerName.toLowerCase().includes(normalizedQuery)
      const matchesAddress = order.deliveryAddress.toLowerCase().includes(normalizedQuery)
      return matchesId || matchesCustomer || matchesAddress
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'highest_value') {
        return b.totalAmount - a.totalAmount
      }
      const timeA = new Date(a.createdAt.replace(' ', 'T')).getTime() || a.id
      const timeB = new Date(b.createdAt.replace(' ', 'T')).getTime() || b.id
      return sortBy === 'oldest' ? timeA - timeB : timeB - timeA
    })
  }, [orders, selectedStatus, searchTerm, sortBy])

  return {
    orders,
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
  }
}
