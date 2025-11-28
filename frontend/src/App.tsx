import { PromptForm } from './components/PromptForm'
import { IconGrid } from './components/IconGrid'
import { LoadingState } from './components/LoadingState'
import { useIconStore } from './stores/iconStore'
import { generateIcons } from './services/api'

function App() {
  const {
    prompt,
    selectedStyleId,
    colors,
    images,
    jobId,
    status,
    error,
    loading,
    setImages,
    setJobId,
    setStatus,
    setError,
    setLoading,
  } = useIconStore()

  const handleSubmit = async (data: {
    prompt: string
    styleId: number
    colors: string[]
  }) => {
    setLoading(true)
    setError(null)
    setImages([])
    setJobId(null)
    setStatus(null)

    try {
      const response = await generateIcons(data)

      // If cached, images are returned immediately
      if (response.images && response.cached) {
        setImages(response.images)
        setStatus('completed')
        setLoading(false)
        return
      }

      // Otherwise, we have a jobId (polling will be handled in Phase 4)
      if (response.jobId) {
        setJobId(response.jobId)
        setStatus('pending')
        // Note: Polling logic will be added in Phase 4
        setLoading(false)
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate icons'
      setError(message)
      setStatus('failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-chat-gray-50">
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

