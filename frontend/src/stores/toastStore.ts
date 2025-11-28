import { create } from 'zustand'
import type { ToastType } from '@/components/ui/Toast'

interface Toast {
  id: string
  message: string
  type: ToastType
  onRetry?: () => void
}

interface ToastStore {
  toasts: Toast[]
  addToast: (
    message: string,
    type?: ToastType,
    onRetry?: () => void
  ) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastStore>(set => ({
  toasts: [],
  addToast: (message, type = 'info', onRetry) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    set(state => ({
      toasts: [...state.toasts, { id, message, type, onRetry }],
    }))
  },
  removeToast: id => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    }))
  },
  clearToasts: () => set({ toasts: [] }),
}))

