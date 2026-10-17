import { ApiResponse, CreateOrderPayload, Order, OrderStatus } from '../types'
import { apiRequest } from './api'

export const orderService = {
  async getAll(): Promise<Order[]> {
    const response = await apiRequest<ApiResponse<Order[]>>('/orders')
    return response.data
  },

  async getById(id: number): Promise<Order> {
    const response = await apiRequest<ApiResponse<Order>>(`/orders/${id}`)
    return response.data
  },

  async create(payload: CreateOrderPayload): Promise<Order> {
    const response = await apiRequest<ApiResponse<Order>>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    return response.data
  },

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const response = await apiRequest<ApiResponse<Order>>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
    return response.data
  }
}
