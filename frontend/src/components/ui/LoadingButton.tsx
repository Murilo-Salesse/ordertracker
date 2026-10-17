import { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, { base: string; fill: string }> = {
  primary: {
    base: 'bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-orange-500',
    fill: 'bg-orange-800/75'
  },
  secondary: {
    base: 'bg-stone-900 text-white hover:bg-stone-800 focus-visible:ring-stone-700',
    fill: 'bg-stone-700/80'
  },
  outline: {
    base: 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 focus-visible:ring-stone-400',
    fill: 'bg-stone-200/80'
  },
  danger: {
    base: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-400',
    fill: 'bg-red-200/75'
  }
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-5 py-3 text-sm rounded-xl'
}

export function LoadingButton({
  isLoading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  ...rest
}: LoadingButtonProps) {
  const styles = variantClasses[variant]
  const isDisabled = disabled || isLoading

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={`relative overflow-hidden font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 inline-flex items-center justify-center gap-2 select-none ${
        sizeClasses[size]
      } ${styles.base} ${
        isLoading ? 'opacity-90 cursor-wait' : isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.99]'
      } ${className}`}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 pointer-events-none animate-button-fill ${styles.fill}`}
        />
      )}
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {isLoading && (
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
          />
        )}
        <span>{isLoading && loadingText ? loadingText : children}</span>
      </span>
    </button>
  )
}
