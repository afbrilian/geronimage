import { useEffect } from 'react'
import { Button } from './Button'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onDismiss: () => void
  onRetry?: () => void
  duration?: number
}

export function Toast({
  message,
  type = 'info',
  onDismiss,
  onRetry,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onDismiss])

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  return (
    <div
      className={`
        ${typeStyles[type]}
        border rounded-lg shadow-chat-md p-4 flex items-start gap-3
        animate-in fade-in slide-in-from-right
      `}
    >
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <Button
            variant="secondary"
            onClick={onRetry}
            className="text-xs px-2 py-1"
          >
            Retry
          </Button>
        )}
        <button
          onClick={onDismiss}
          className="text-current opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{
    id: string
    message: string
    type?: ToastType
    onRetry?: () => void
  }>
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => onDismiss(toast.id)}
          onRetry={toast.onRetry}
        />
      ))}
    </div>
  )
}

