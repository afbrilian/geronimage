import type {
  GenerateRequest,
  GenerateResponse,
  JobStatus,
  HealthStatus,
} from '@/types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

async function fetchJSON<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }))
    throw new Error(error.error || error.message || 'Request failed')
  }

  return response.json()
}

export async function generateIcons(
  request: GenerateRequest
): Promise<GenerateResponse> {
  try {
    return await fetchJSON<GenerateResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate icons'
    throw new Error(message)
  }
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  try {
    return await fetchJSON<JobStatus>(`/api/status/${jobId}`)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to get job status'
    throw new Error(message)
  }
}

export async function healthCheck(): Promise<HealthStatus> {
  try {
    return await fetchJSON<HealthStatus>('/health')
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Health check failed'
    throw new Error(message)
  }
}

