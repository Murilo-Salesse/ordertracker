import { LogOut, PackageCheck, Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface NavbarProps {
  onOpenCreateModal: () => void
}

export function Navbar({ onOpenCreateModal }: NavbarProps) {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
            <PackageCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-900 tracking-tight">Foody Delivery</span>
              <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200/60">
                Order Tracker
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Gestão e rastreamento de pedidos em tempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Novo Pedido</span>
          </button>

          <div className="h-6 w-px bg-stone-200 hidden sm:block" aria-hidden="true" />

          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-medium text-stone-800 leading-tight">{user?.name}</span>
            <span className="text-[11px] text-stone-500 leading-tight">{user?.email}</span>
          </div>

          <button
            type="button"
            onClick={signOut}
            title="Sair da conta"
            aria-label="Sair da conta"
            className="inline-flex items-center gap-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
