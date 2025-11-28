import { Loading } from './ui/Loading'
import type { JobStatusType } from '@/types'

interface LoadingStateProps {
  message?: string
  status?: JobStatusType
}

const statusMessages: Record<string, string> = {
  pending: 'Job is queued and waiting to be processed...',
  processing: 'Generating icons...',
}

export function LoadingState({
  message,
  status,
}: LoadingStateProps) {
  const displayMessage =
    message || (status ? statusMessages[status] : 'Loading...')

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Loading size="lg" />
      <p className="text-chat-gray-600 text-center animate-pulse">
        {displayMessage}
      </p>
    </div>
  )
}

