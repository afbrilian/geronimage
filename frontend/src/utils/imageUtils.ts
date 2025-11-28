const TARGET_SIZE = 512

export async function resizeImageTo512x512(
  imageUrl: string,
  backgroundColor: string = 'transparent'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = TARGET_SIZE
        canvas.height = TARGET_SIZE
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Fill background (only if not transparent)
        if (backgroundColor !== 'transparent') {
          ctx.fillStyle = backgroundColor
          ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE)
        }

        // Calculate dimensions to maintain aspect ratio and center
        const imgAspect = img.width / img.height
        let drawWidth = TARGET_SIZE
        let drawHeight = TARGET_SIZE
        let offsetX = 0
        let offsetY = 0

        if (imgAspect > 1) {
          // Image is wider
          drawHeight = TARGET_SIZE / imgAspect
          offsetY = (TARGET_SIZE - drawHeight) / 2
        } else {
          // Image is taller or square
          drawWidth = TARGET_SIZE * imgAspect
          offsetX = (TARGET_SIZE - drawWidth) / 2
        }

        // Draw image centered
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

        // Convert to blob
        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          'image/png',
          1.0
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = imageUrl
  })
}

export async function downloadImageAs512x512(
  imageUrl: string,
  filename: string
): Promise<void> {
  try {
    const blob = await resizeImageTo512x512(imageUrl)
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

