import { create } from 'zustand'
import type { JobStatusType } from '@/types'
import { generateIcons as apiGenerateIcons, getJobStatus } from '@/services/api'
import type { GenerateRequest } from '@/types'

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

  // Polling state
  pollingInterval: number | null
  pollingActive: boolean
  retryCount: number
  maxRetries: number
  abortController: AbortController | null

  // Actions
  setPrompt: (prompt: string) => void
  setStyleId: (styleId: number) => void
  setColors: (colors: string[]) => void
  setImages: (images: string[]) => void
  setJobId: (jobId: string | null) => void
  setStatus: (status: JobStatusType | null) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  generateIcons: (request: GenerateRequest) => Promise<void>
  startPolling: (jobId: string) => void
  stopPolling: () => void
  retryJob: () => Promise<void>
  cancelRequest: () => void
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
  pollingInterval: null,
  pollingActive: false,
  retryCount: 0,
  maxRetries: 3,
  abortController: null,
}

export const useIconStore = create<IconStore>((set, get) => ({
  ...initialState,

  setPrompt: (prompt: string) => set({ prompt }),
  setStyleId: (styleId: number) => set({ selectedStyleId: styleId }),
  setColors: (colors: string[]) => set({ colors }),
  setImages: (images: string[]) => set({ images }),
  setJobId: (jobId: string | null) => set({ jobId }),
  setStatus: (status: JobStatusType | null) => set({ status }),
  setError: (error: string | null) => set({ error }),
  setLoading: (loading: boolean) => set({ loading }),

  generateIcons: async (request: GenerateRequest) => {
    const state = get()
    
    // Cancel any existing request
    if (state.abortController) {
      state.abortController.abort()
    }
    if (state.pollingActive) {
      state.stopPolling()
    }

    // Create new abort controller
    const abortController = new AbortController()
    
    set({
      loading: true,
      error: null,
      images: [],
      jobId: null,
      status: null,
      retryCount: 0,
      abortController,
    })

    try {
      const response = await apiGenerateIcons(request, abortController.signal)

      // If cached, images are returned immediately
      if (response.images && response.cached) {
        set({
          images: response.images,
          status: 'completed',
          loading: false,
          abortController: null,
        })
        return
      }

      // Otherwise, start polling
      if (response.jobId) {
        set({
          jobId: response.jobId,
          status: 'pending',
          // Keep loading true during polling
        })
        get().startPolling(response.jobId)
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('cancelled'))) {
        return
      }

      const message =
        err instanceof Error ? err.message : 'Failed to generate icons'
      set({
        error: message,
        status: 'failed',
        loading: false,
        abortController: null,
      })
    }
  },

  startPolling: (jobId: string) => {
    const state = get()
    
    // Stop any existing polling
    if (state.pollingInterval) {
      clearInterval(state.pollingInterval)
    }

    const maxPollDuration = 5 * 60 * 1000 // 5 minutes
    const startTime = Date.now()

    const poll = async () => {
      const currentState = get()
      
      // Check if we've exceeded max duration
      if (Date.now() - startTime > maxPollDuration) {
        currentState.stopPolling()
        set({
          error: 'Request timed out. Please try again.',
          status: 'failed',
          loading: false,
        })
        return
      }

      // Determine polling interval (backoff after 30 seconds)
      const elapsed = Date.now() - startTime
      const interval = elapsed > 30000 ? 5000 : 2000

      try {
        const currentState = get()
        const jobStatus = await getJobStatus(
          jobId,
          currentState.abortController?.signal
        )

        set({
          status: jobStatus.status,
          retryCount: 0, // Reset retry count on successful poll
        })

        if (jobStatus.status === 'completed' && jobStatus.images) {
          currentState.stopPolling()
          set({
            images: jobStatus.images,
            loading: false,
            error: null,
          })
        } else if (jobStatus.status === 'failed') {
          currentState.stopPolling()
          set({
            error: jobStatus.error || 'Icon generation failed',
            loading: false,
          })
        }
        // Continue polling for 'pending' or 'processing'
      } catch (err) {
        const currentState = get()
        const retryCount = currentState.retryCount + 1

        if (retryCount >= currentState.maxRetries) {
          currentState.stopPolling()
          const message =
            err instanceof Error ? err.message : 'Failed to check job status'
          set({
            error: `Failed after ${retryCount} attempts: ${message}`,
            status: 'failed',
            loading: false,
          })
        } else {
          // Retry with exponential backoff
          set({ retryCount })
          const backoffInterval = Math.min(5000 * Math.pow(2, retryCount - 1), 30000)
          
          // Clear current interval and set new one with backoff
          if (currentState.pollingInterval) {
            clearInterval(currentState.pollingInterval)
          }
          
          const backoffTimeout = setTimeout(() => {
            poll()
            // Restart normal polling after retry
            const normalInterval = setInterval(poll, interval)
            set({ pollingInterval: normalInterval })
          }, backoffInterval)
          
          set({ pollingInterval: backoffTimeout as unknown as number })
        }
      }
    }

    // Start polling immediately, then at intervals
    poll()
    const interval = setInterval(poll, 2000)

    set({
      pollingInterval: interval,
      pollingActive: true,
    })
  },

  stopPolling: () => {
    const state = get()
    if (state.pollingInterval) {
      clearInterval(state.pollingInterval)
    }
    set({
      pollingInterval: null,
      pollingActive: false,
    })
  },

  retryJob: async () => {
    const state = get()
    const jobId = state.jobId

    if (!jobId) {
      set({
        error: 'No job to retry. Please generate new icons.',
      })
      return
    }

    set({
      error: null,
      retryCount: 0,
      loading: true,
    })

    state.startPolling(jobId)
  },

  cancelRequest: () => {
    const state = get()
    if (state.abortController) {
      state.abortController.abort()
    }
    state.stopPolling()
    set({
      abortController: null,
      loading: false,
    })
  },

  reset: () => {
    const state = get()
    state.cancelRequest()
    set(initialState)
  },
}))
