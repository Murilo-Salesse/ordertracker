import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { authService } from '../services/authService'
import { clearStoredSession } from '../services/api'
import { AuthUser, LoginPayload, RegisterPayload } from '../types'

interface AuthContextData {
  user: AuthUser | null
  isAuthenticated: boolean
  signIn: (payload: LoginPayload) => Promise<void>
  signUp: (payload: RegisterPayload) => Promise<void>
  signOut: () => void
}

const STORAGE_TOKEN_KEY = '@foody:token'
const STORAGE_USER_KEY = '@foody:user'

const AuthContext = createContext<AuthContextData | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem(STORAGE_USER_KEY)
    const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY)
    if (!savedUser || !savedToken) return null
    try {
      return JSON.parse(savedUser) as AuthUser
    } catch {
      return null
    }
  })

  const saveSession = useCallback((token: string, nextUser: AuthUser) => {
    localStorage.setItem(STORAGE_TOKEN_KEY, token)
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser))
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

  const signIn = useCallback(async (payload: LoginPayload) => {
    const data = await authService.login(payload)
    saveSession(data.token, { name: data.name, email: data.email })
    toast.success(`Bem-vindo de volta, ${data.name.split(' ')[0]}!`)
  }, [saveSession])

  const signUp = useCallback(async (payload: RegisterPayload) => {
    const data = await authService.register(payload)
    saveSession(data.token, { name: data.name, email: data.email })
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
