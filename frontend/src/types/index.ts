export type OrderStatus =
  | 'RECEBIDO'
  | 'EM_PREPARO'
  | 'SAIU_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'CANCELADO'

export interface ApiResponse<T> {
  message: string
  data: T
}

export interface ProblemDetailError {
  title?: string
  status?: number
  detail?: string
  invalidFields?: Record<string, string>
}

export interface AuthUser {
  name: string
  email: string
}

export interface AuthResponse extends AuthUser {
  token: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface OrderItem {
  id: number
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: number
  customerName: string
  deliveryAddress: string
  status: OrderStatus
  statusDescription: string
  items: OrderItem[]
  totalAmount: number
  createdAt: string
  updatedAt: string
}

export interface CreateOrderItemPayload {
  name: string
  quantity: number
  unitPrice: number
}

export interface CreateOrderPayload {
  customerName: string
  deliveryAddress: string
  items: CreateOrderItemPayload[]
}
