import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const targetPath = isAuthenticated ? '/orders' : '/login'
    if (window.location.pathname !== targetPath) {
      window.history.replaceState(null, '', targetPath)
    }
  }, [isAuthenticated])

  return isAuthenticated ? <DashboardPage /> : <AuthPage />
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            background: '#1c1917',
            color: '#fafaf9',
            fontSize: '13px',
            fontWeight: 500
          }
        }}
      />
    </AuthProvider>
  )
}
