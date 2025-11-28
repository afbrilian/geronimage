import { useState } from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Loading } from './ui/Loading'

interface IconGridProps {
  images: string[]
  loading?: boolean
}

async function downloadImage(url: string, filename: string) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Failed to download image:', error)
    throw error
  }
}

export function IconGrid({ images, loading = false }: IconGridProps) {
  const [downloading, setDownloading] = useState<number | 'all' | null>(null)

  const handleDownload = async (index: number) => {
    if (!images[index]) return

    setDownloading(index)
    try {
      await downloadImage(images[index], `icon-${index + 1}.png`)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download image. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  const handleDownloadAll = async () => {
    if (images.length === 0) return

    setDownloading('all')
    try {
      await Promise.all(
        images.map((url, index) =>
          downloadImage(url, `icon-${index + 1}.png`)
        )
      )
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download some images. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="aspect-square">
            <div className="w-full h-full flex items-center justify-center">
              <Loading />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-chat-gray-500">No icons generated yet</p>
        <p className="text-sm text-chat-gray-400 mt-2">
          Enter a prompt and select a style to generate icons
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={handleDownloadAll}
            loading={downloading === 'all'}
            disabled={downloading !== null}
          >
            Download All
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {images.map((url, index) => (
          <Card key={index} padding="sm" className="relative group">
            <div className="aspect-square bg-chat-gray-50 rounded-lg overflow-hidden relative">
              <img
                src={url}
                alt={`Generated icon ${index + 1}`}
                className="w-full h-full object-contain"
                onError={e => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-smooth flex items-center justify-center">
                <Button
                  variant="primary"
                  onClick={() => handleDownload(index)}
                  loading={downloading === index}
                  disabled={downloading !== null}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-sm px-3 py-1.5"
                >
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

