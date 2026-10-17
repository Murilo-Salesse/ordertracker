import { ExternalLink, MapPin, Navigation, User, X } from 'lucide-react'
import { useEffect } from 'react'
import { Order } from '../../types'
import { StatusBadge } from '../ui/StatusBadge'

interface OrderMapModalProps {
  order: Order | null
  onClose: () => void
}

export function OrderMapModal({ order, onClose }: OrderMapModalProps) {
  useEffect(() => {
    if (!order) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [order, onClose])

  if (!order) return null

  const cleanAddressQuery = order.deliveryAddress.replace(/^\d{5}-?\d{3}\s*-\s*/, '')
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    cleanAddressQuery
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`
  const googleMapsRouteUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    cleanAddressQuery
  )}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-modal-title"
    >
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl w-full max-w-2xl overflow-hidden animate-modal-enter">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Navigation className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="map-modal-title" className="text-base font-semibold text-stone-900 truncate">
                  Localização de Entrega — Pedido #{order.id}
                </h2>
                <StatusBadge status={order.status} label={order.statusDescription} />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar mapa"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-stone-900 font-semibold">
                <User className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                <span>{order.customerName}</span>
              </div>
              <div className="flex items-start gap-1.5 text-stone-600">
                <MapPin className="h-3.5 w-3.5 text-orange-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{order.deliveryAddress}</span>
              </div>
            </div>

            <a
              href={googleMapsRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium whitespace-nowrap transition-colors shrink-0"
            >
              <span>Traçar rota GPS</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-100 h-80 sm:h-96 relative">
            <iframe
              title={`Mapa de entrega do pedido #${order.id}`}
              src={mapEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
