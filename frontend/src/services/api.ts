import { ProblemDetailError } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const STORAGE_TOKEN_KEY = '@foody:token'
const STORAGE_USER_KEY = '@foody:user'

export class ApiError extends Error {
  status: number
  invalidFields?: Record<string, string>

  constructor(message: string, status: number, invalidFields?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.invalidFields = invalidFields
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_TOKEN_KEY)
}

export function clearStoredSession(): void {
  localStorage.removeItem(STORAGE_TOKEN_KEY)
  localStorage.removeItem(STORAGE_USER_KEY)
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    })
  } catch {
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique se o back-end está rodando na porta 8080.',
      0
    )
  }

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json') || contentType.includes('application/problem+json')
  const body = isJson ? await response.json() : null

  if (!response.ok) {
    if (response.status === 401 && !endpoint.startsWith('/auth')) {
      clearStoredSession()
      window.dispatchEvent(new Event('auth:unauthorized'))
    }

    const problem = body as ProblemDetailError | null
    if (problem?.invalidFields) {
      const firstFieldError = Object.values(problem.invalidFields)[0]
      throw new ApiError(
        firstFieldError || problem.detail || 'Dados inválidos.',
        response.status,
        problem.invalidFields
      )
    }

    throw new ApiError(
      problem?.detail || 'Ocorreu um erro ao processar a solicitação.',
      response.status
    )
  }

  return body as T
}
