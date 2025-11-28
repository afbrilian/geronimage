import { useEffect } from 'react'
import { PromptForm } from './components/PromptForm'
import { IconGrid } from './components/IconGrid'
import { LoadingState } from './components/LoadingState'
import { ToastContainer } from './components/ui/Toast'
import { useIconStore } from './stores/iconStore'
import { useToastStore } from './stores/toastStore'

function App() {
  const {
    prompt,
    selectedStyleId,
    colors,
    images,
    status,
    error,
    loading,
    generateIcons,
    cancelRequest,
    retryJob,
  } = useIconStore()

  const { toasts, addToast, removeToast } = useToastStore()

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest()
    }
  }, [cancelRequest])

  // Show toasts for errors and success
  useEffect(() => {
    if (error && status === 'failed') {
      addToast(error, 'error', retryJob)
    }
  }, [error, status, addToast, retryJob])

  useEffect(() => {
    if (images.length > 0 && status === 'completed') {
      addToast('Icons generated successfully!', 'success')
    }
  }, [images.length, status, addToast])

  const handleSubmit = async (data: {
    prompt: string
    styleId: number
    colors: string[]
  }) => {
    await generateIcons(data)
  }

  return (
    <div className="min-h-screen bg-chat-gray-50">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-chat-gray-900">
            Geronimage
          </h1>
          <p className="text-chat-gray-600 mt-2">
            Generate 4 consistent style icons from a single prompt
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Form */}
          <aside className="lg:col-span-1">
            <PromptForm
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
              initialPrompt={prompt}
              initialStyleId={selectedStyleId}
              initialColors={colors}
            />
            {error && status === 'failed' && (
              <div className="mt-4">
                <button
                  onClick={retryJob}
                  className="text-sm text-primary-600 hover:text-primary-700 underline"
                >
                  Retry
                </button>
              </div>
            )}
          </aside>

          {/* Main Content - Results */}
          <main className="lg:col-span-2">
            {loading && status && status !== 'completed' ? (
              <LoadingState status={status} />
            ) : images.length > 0 ? (
              <IconGrid images={images} />
            ) : (
              <IconGrid images={[]} />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
