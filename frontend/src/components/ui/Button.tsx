import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  loading?: boolean
  loadingText?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  loading = false,
  loadingText = 'Loading...',
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'px-4 py-2 rounded-lg font-medium transition-smooth focus-ring disabled:opacity-50 disabled:cursor-not-allowed'
  const variantStyles = {
    primary:
      'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow-md',
    secondary:
      'bg-chat-gray-100 text-chat-gray-900 hover:bg-chat-gray-200 active:bg-chat-gray-300 border border-chat-gray-200',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}

