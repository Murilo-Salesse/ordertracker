import { Lock, Mail, PackageCheck, User } from 'lucide-react'
import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import { LoadingButton } from '../components/ui/LoadingButton'
import { useAuth } from '../contexts/AuthContext'

export function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleToggleMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (mode === 'register' && name.trim().length < 2) {
      toast.error('O nome deve ter pelo menos 2 caracteres.')
      return
    }
    if (!email.includes('@')) {
      toast.error('Informe um e-mail válido.')
      return
    }
    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.')
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'login') {
        await signIn({ email: email.trim(), password })
      } else {
        await signUp({ name: name.trim(), email: email.trim(), password })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha na autenticação.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-sm">
            <PackageCheck className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-stone-900">
          Foody Delivery
        </h1>
        <p className="mt-1 text-center text-sm text-stone-600">
          Central de rastreamento e operação de pedidos
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 shadow-xs rounded-2xl border border-stone-200/90 sm:px-8">
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl mb-6" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => handleToggleMode('login')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => handleToggleMode('register')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-medium text-stone-700 mb-1.5">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" aria-hidden="true" />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-stone-700 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-stone-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" aria-hidden="true" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="Mínimo de 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            <div className="pt-2">
              <LoadingButton
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                loadingText={mode === 'login' ? 'Autenticando...' : 'Criando conta...'}
                className="w-full"
              >
                {mode === 'login' ? 'Acessar painel' : 'Finalizar cadastro'}
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
