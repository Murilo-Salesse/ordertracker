import { MapPin, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import { FormEvent, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useViaCep } from '../../hooks/useViaCep'
import { CreateOrderItemPayload, CreateOrderPayload } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { LoadingButton } from '../ui/LoadingButton'

interface CreateOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateOrder: (payload: CreateOrderPayload) => Promise<unknown>
}

const suggestedCatalog: CreateOrderItemPayload[] = [
  { name: 'Smash Burger Duplo Bacon', quantity: 1, unitPrice: 36.9 },
  { name: 'Pizza Margherita Artesanal', quantity: 1, unitPrice: 64.9 },
  { name: 'Combo Sushi Especial (16 pçs)', quantity: 1, unitPrice: 58.0 },
  { name: 'Batata Frita Rústica', quantity: 1, unitPrice: 19.9 },
  { name: 'Açaí Tradicional 500ml', quantity: 1, unitPrice: 26.5 },
  { name: 'Refrigerante Lata 350ml', quantity: 1, unitPrice: 7.5 }
]

export function CreateOrderModal({
  isOpen,
  onClose,
  onCreateOrder
}: CreateOrderModalProps) {
  const [customerName, setCustomerName] = useState('')
  const [cepInput, setCepInput] = useState('')
  const [addressNumber, setAddressNumber] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [items, setItems] = useState<CreateOrderItemPayload[]>([
    { name: 'Smash Burger Duplo Bacon', quantity: 1, unitPrice: 36.9 }
  ])
  const [customItemName, setCustomItemName] = useState('')
  const [customItemQty, setCustomItemQty] = useState('1')
  const [customItemPrice, setCustomItemPrice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { isFetchingCep, lookupCep } = useViaCep()

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  const handleCepChange = async (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
    setCepInput(formatted)

    if (digits.length === 8) {
      const resolvedAddress = await lookupCep(digits)
      if (resolvedAddress) {
        setDeliveryAddress(
          addressNumber.trim()
            ? `${resolvedAddress}, Nº ${addressNumber.trim()}`
            : resolvedAddress
        )
        toast.success('Endereço preenchido via CEP!')
      }
    }
  }

  const handleQuickAddItem = (preset: CreateOrderItemPayload) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.name === preset.name)
      if (existingIndex >= 0) {
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...preset }]
    })
  }

  const handleAddCustomItem = () => {
    const trimmedName = customItemName.trim()
    const quantity = Number.parseInt(customItemQty, 10)
    const unitPrice = Number.parseFloat(customItemPrice.replace(',', '.'))

    if (!trimmedName) {
      toast.error('Informe o nome do item.')
      return
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      toast.error('A quantidade deve ser de pelo menos 1.')
      return
    }
    if (Number.isNaN(unitPrice) || unitPrice <= 0) {
      toast.error('Informe um preço unitário válido.')
      return
    }

    setItems(prev => [...prev, { name: trimmedName, quantity, unitPrice }])
    setCustomItemName('')
    setCustomItemQty('1')
    setCustomItemPrice('')
  }

  const handleQuantityDelta = (index: number, delta: number) => {
    setItems(prev =>
      prev
        .map((item, idx) =>
          idx === index ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index))
  }

  const totalOrderAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (customerName.trim().length < 2) {
      toast.error('Informe o nome do cliente (mínimo 2 caracteres).')
      return
    }
    if (deliveryAddress.trim().length < 5) {
      toast.error('Informe o endereço completo de entrega.')
      return
    }
    if (items.length === 0) {
      toast.error('Adicione pelo menos um item ao pedido.')
      return
    }

    setIsSubmitting(true)
    try {
      await onCreateOrder({
        customerName: customerName.trim(),
        deliveryAddress: deliveryAddress.trim(),
        items
      })
      setCustomerName('')
      setCepInput('')
      setAddressNumber('')
      setDeliveryAddress('')
      setItems([{ name: 'Smash Burger Duplo Bacon', quantity: 1, unitPrice: 36.9 }])
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar pedido.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-order-title"
    >
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl w-full max-w-2xl overflow-hidden animate-modal-enter my-auto">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 id="create-order-title" className="text-lg font-semibold text-stone-900">
              Novo Pedido
            </h2>
            <p className="text-xs text-stone-500">
              Preencha os dados do cliente e selecione os itens para entrega
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fechar modal"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="customer-name" className="block text-xs font-medium text-stone-700 mb-1.5">
                Nome do Cliente *
              </label>
              <input
                id="customer-name"
                type="text"
                required
                placeholder="Ex: Fernanda Souza"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div>
              <label htmlFor="cep-input" className="block text-xs font-medium text-stone-700 mb-1.5">
                Buscar por CEP <span className="text-stone-400 font-normal">(ViaCEP)</span>
              </label>
              <div className="relative">
                <input
                  id="cep-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="01310-100"
                  value={cepInput}
                  onChange={e => handleCepChange(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 pl-3.5 pr-9 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
                <Search
                  className={`h-4 w-4 absolute right-3 top-3 ${
                    isFetchingCep ? 'text-orange-500 animate-spin' : 'text-stone-400'
                  }`}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="delivery-address" className="block text-xs font-medium text-stone-700 mb-1.5">
              Endereço de Entrega *
            </label>
            <div className="relative">
              <MapPin className="h-4 w-4 text-stone-400 absolute left-3.5 top-3" aria-hidden="true" />
              <input
                id="delivery-address"
                type="text"
                required
                placeholder="Rua, número, complemento, bairro e cidade"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                className="w-full rounded-xl border border-stone-300 pl-10 pr-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-700 inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
                Sugestões rápidas do cardápio (1 clique)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedCatalog.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleQuickAddItem(preset)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl border border-stone-200 hover:border-orange-400 hover:bg-orange-50/40 text-left transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium text-stone-800 truncate group-hover:text-orange-900">
                      {preset.name}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      {formatCurrency(preset.unitPrice)}
                    </p>
                  </div>
                  <span className="h-6 w-6 rounded-lg bg-stone-100 group-hover:bg-orange-600 group-hover:text-white text-stone-600 flex items-center justify-center shrink-0 transition-colors">
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 space-y-3">
            <p className="text-xs font-medium text-stone-700">
              Ou adicionar item personalizado
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Nome do item"
                value={customItemName}
                onChange={e => setCustomItemName(e.target.value)}
                className="sm:col-span-6 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-orange-500 focus:outline-none"
              />
              <input
                type="number"
                min="1"
                max="1000"
                placeholder="Qtd"
                value={customItemQty}
                onChange={e => setCustomItemQty(e.target.value)}
                className="sm:col-span-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-orange-500 focus:outline-none"
              />
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Preço (R$)"
                value={customItemPrice}
                onChange={e => setCustomItemPrice(e.target.value)}
                className="sm:col-span-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-orange-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="sm:col-span-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-700">
                Itens selecionados ({items.length})
              </span>
              <span className="text-sm font-bold text-stone-900">
                Total: {formatCurrency(totalOrderAmount)}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-4 rounded-xl border border-dashed border-stone-300 text-xs text-stone-500">
                Nenhum item selecionado. Clique em um item do cardápio acima.
              </div>
            ) : (
              <ul className="divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden">
                {items.map((item, index) => (
                  <li
                    key={`${item.name}-${index}`}
                    className="px-3.5 py-2.5 bg-white flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-stone-900 truncate">{item.name}</p>
                      <p className="text-stone-500">
                        {formatCurrency(item.unitPrice)} cada
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="inline-flex items-center rounded-lg border border-stone-200 bg-stone-50">
                        <button
                          type="button"
                          onClick={() => handleQuantityDelta(index, -1)}
                          className="px-2 py-1 text-stone-600 hover:text-stone-900 cursor-pointer font-semibold"
                          aria-label="Diminuir quantidade"
                        >
                          -
                        </button>
                        <span className="px-2 font-semibold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityDelta(index, 1)}
                          className="px-2 py-1 text-stone-600 hover:text-stone-900 cursor-pointer font-semibold"
                          aria-label="Aumentar quantidade"
                        >
                          +
                        </button>
                      </div>

                      <span className="w-20 text-right font-semibold text-stone-900">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        aria-label={`Remover ${item.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <LoadingButton
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              loadingText="Registrando pedido..."
            >
              Confirmar Pedido ({formatCurrency(totalOrderAmount)})
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  )
}
