import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'

interface ViaCepResponse {
  cep: string
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export function useViaCep() {
  const [isFetchingCep, setIsFetchingCep] = useState(false)

  const lookupCep = useCallback(async (rawCep: string): Promise<string | null> => {
    const digits = rawCep.replace(/\D/g, '')
    if (digits.length !== 8) return null

    setIsFetchingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      if (!response.ok) return null

      const data = (await response.json()) as ViaCepResponse
      if (data.erro) {
        toast.error('CEP não encontrado.')
        return null
      }

      const formattedCep = `${digits.slice(0, 5)}-${digits.slice(5)}`
      const parts = [data.logradouro, data.bairro, `${data.localidade}/${data.uf}`].filter(Boolean)
      return `${formattedCep} - ${parts.join(', ')}`
    } catch {
      toast.error('Não foi possível consultar o CEP no momento.')
      return null
    } finally {
      setIsFetchingCep(false)
    }
  }, [])

  return {
    isFetchingCep,
    lookupCep
  }
}
