import type {
  GenerateRequest,
  GenerateResponse,
  JobStatus,
  HealthStatus,
} from '@/types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const DEFAULT_TIMEOUT = 30000 // 30 seconds

export function createAbortController(): AbortController {
  return new AbortController()
}

async function fetchJSON<T>(
  endpoint: string,
  options?: RequestInit & { timeout?: number }
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, signal: providedSignal, ...fetchOptions } = options || {}
  const abortController = providedSignal ? null : createAbortController()
  const signal = providedSignal || (abortController?.signal as AbortSignal)

  // Set up timeout only if we created our own abort controller
  const timeoutId = abortController ? setTimeout(() => {
    abortController.abort()
  }, timeout) : null

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    })

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }))
      
      // Handle rate limiting
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }
      
      throw new Error(error.error || error.message || 'Request failed')
    }

    return response.json()
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled or timed out')
      }
      throw error
    }
    
    throw new Error('Network error occurred')
  }
}

export async function generateIcons(
  request: GenerateRequest,
  signal?: AbortSignal
): Promise<GenerateResponse> {
  try {
    return await fetchJSON<GenerateResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify(request),
      signal,
      timeout: 30000,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate icons'
    throw new Error(message)
  }
}

export async function getJobStatus(
  jobId: string,
  signal?: AbortSignal
): Promise<JobStatus> {
  try {
    return await fetchJSON<JobStatus>(`/api/status/${jobId}`, {
      signal,
      timeout: 10000, // Shorter timeout for status checks
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to get job status'
    throw new Error(message)
  }
}

export async function healthCheck(): Promise<HealthStatus> {
  try {
    return await fetchJSON<HealthStatus>('/health', {
      timeout: 5000,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Health check failed'
    throw new Error(message)
  }
}
