import { useState, useEffect } from 'react'
import JSZip from 'jszip'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Skeleton } from './ui/Skeleton'
import { downloadImageAs512x512, resizeImageTo512x512 } from '@/utils/imageUtils'
import { useToastStore } from '@/stores/toastStore'

interface IconGridProps {
  images: string[]
  loading?: boolean
}


export function IconGrid({ images, loading = false }: IconGridProps) {
  const [downloading, setDownloading] = useState<number | 'all' | null>(null)
  const [showAnimation, setShowAnimation] = useState(false)
  const addToast = useToastStore(state => state.addToast)

  // Trigger success animation when images appear
  useEffect(() => {
    if (images.length > 0 && !loading) {
      setShowAnimation(true)
      const timer = setTimeout(() => setShowAnimation(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [images.length, loading])

  const handleDownload = async (index: number) => {
    if (!images[index]) return

    setDownloading(index)
    try {
      await downloadImageAs512x512(images[index], `icon-${index + 1}.png`)
      addToast(`Icon ${index + 1} downloaded successfully`, 'success')
    } catch (error) {
      console.error('Download failed:', error)
      addToast('Failed to download image. Please try again.', 'error')
    } finally {
      setDownloading(null)
    }
  }

  const handleDownloadAll = async () => {
    if (images.length === 0) return

    setDownloading('all')
    try {
      const zip = new JSZip()

      // Resize and add all images to ZIP
      await Promise.all(
        images.map(async (url, index) => {
          try {
            const blob = await resizeImageTo512x512(url)
            zip.file(`icon-${index + 1}.png`, blob)
          } catch (error) {
            console.error(`Failed to process image ${index + 1}:`, error)
            throw error
          }
        })
      )

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' })

      // Download ZIP
      const zipUrl = window.URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = zipUrl
      link.download = 'icons.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(zipUrl)

      addToast('All icons downloaded as ZIP successfully', 'success')
    } catch (error) {
      console.error('Download failed:', error)
      addToast('Failed to download images. Please try again.', 'error')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="aspect-square p-0 overflow-hidden">
            <div className="w-full h-full p-4 flex flex-col items-center justify-center gap-3">
              <Skeleton className="w-3/4 h-3/4" variant="square" />
              <Skeleton className="w-1/2 h-4" variant="text" />
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
          <Card
            key={index}
            padding="sm"
            className={`
              relative group aspect-square p-0 overflow-hidden
              transition-all duration-500
              ${
                showAnimation
                  ? 'animate-in fade-in zoom-in-95'
                  : ''
              }
            `}
          >
            <div className="w-full h-full rounded-lg relative flex items-center justify-center">
              <img
                src={url}
                alt={`Generated icon ${index + 1}`}
                className="w-full h-full object-contain p-2"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
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
