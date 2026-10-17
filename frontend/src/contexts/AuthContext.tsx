import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'
import {
  clearStoredSession,
  STORAGE_REMEMBER_EMAIL_KEY,
  STORAGE_TOKEN_KEY,
  STORAGE_USER_KEY
} from '../services/api'
import { AuthUser, LoginPayload, RegisterPayload } from '../types'

interface AuthContextData {
  user: AuthUser | null
  isAuthenticated: boolean
  signIn: (payload: LoginPayload, rememberMe?: boolean) => Promise<void>
  signUp: (payload: RegisterPayload) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextData | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser =
      localStorage.getItem(STORAGE_USER_KEY) || sessionStorage.getItem(STORAGE_USER_KEY)
    const savedToken =
      localStorage.getItem(STORAGE_TOKEN_KEY) || sessionStorage.getItem(STORAGE_TOKEN_KEY)
    if (!savedUser || !savedToken) return null
    try {
      return JSON.parse(savedUser) as AuthUser
    } catch {
      return null
    }
  })

  const saveSession = useCallback((token: string, nextUser: AuthUser, rememberMe = true) => {
    clearStoredSession()
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem(STORAGE_TOKEN_KEY, token)
    storage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser))

    if (rememberMe) {
      localStorage.setItem(STORAGE_REMEMBER_EMAIL_KEY, nextUser.email)
    } else {
      localStorage.removeItem(STORAGE_REMEMBER_EMAIL_KEY)
    }

    setUser(nextUser)
  }, [])

  const signOut = useCallback(() => {
    clearStoredSession()
    setUser(null)
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      toast.error('Sua sessão expirou. Faça login novamente.')
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const signIn = useCallback(async (payload: LoginPayload, rememberMe = true) => {
    const data = await authService.login(payload)
    saveSession(data.token, { name: data.name, email: data.email }, rememberMe)
    toast.success(`Bem-vindo de volta, ${data.name.split(' ')[0]}!`)
  }, [saveSession])

  const signUp = useCallback(async (payload: RegisterPayload) => {
    const data = await authService.register(payload)
    saveSession(data.token, { name: data.name, email: data.email }, true)
    toast.success('Conta criada com sucesso!')
  }, [saveSession])

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      signIn,
      signUp,
      signOut
    }),
    [user, signIn, signUp, signOut]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
