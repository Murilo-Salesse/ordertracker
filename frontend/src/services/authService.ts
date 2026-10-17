import { ApiResponse, AuthResponse, LoginPayload, RegisterPayload } from '../types'
import { apiRequest } from './api'

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiRequest<ApiResponse<AuthResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    return response.data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiRequest<ApiResponse<AuthResponse>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    return response.data
  }
}
