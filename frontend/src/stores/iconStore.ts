import { create } from 'zustand'
import type { JobStatusType } from '@/types'

interface IconStore {
  // Form state
  prompt: string
  selectedStyleId: number | null
  colors: string[]

  // Job state
  images: string[]
  jobId: string | null
  status: JobStatusType | null
  error: string | null
  loading: boolean

  // Actions
  setPrompt: (prompt: string) => void
  setStyleId: (styleId: number) => void
  setColors: (colors: string[]) => void
  setImages: (images: string[]) => void
  setJobId: (jobId: string | null) => void
  setStatus: (status: JobStatusType | null) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  prompt: '',
  selectedStyleId: null,
  colors: [],
  images: [],
  jobId: null,
  status: null,
  error: null,
  loading: false,
}

export const useIconStore = create<IconStore>(set => ({
  ...initialState,

  setPrompt: (prompt: string) => set({ prompt }),
  setStyleId: (styleId: number) => set({ selectedStyleId: styleId }),
  setColors: (colors: string[]) => set({ colors }),
  setImages: (images: string[]) => set({ images }),
  setJobId: (jobId: string | null) => set({ jobId }),
  setStatus: (status: JobStatusType | null) => set({ status }),
  setError: (error: string | null) => set({ error }),
  setLoading: (loading: boolean) => set({ loading }),
  reset: () => set(initialState),
}))

