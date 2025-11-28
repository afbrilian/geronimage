import { generateImage } from './replicate.js'
import { buildPrompt } from './promptService.js'
import { cache } from './cache.js'
import { generateObjectVariations } from './openaiService.js'
import { getHardcodedVariations } from './objectVariations.js'

export interface Job {
  id: string
  data: {
    prompt: string
    styleId: number
    colors?: string[]
  }
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: string[]
  error?: string
  createdAt: Date
  completedAt?: Date
}

class SimpleQueue {
  private queue: Job[] = []
  private processing = false
  private maxConcurrent = 2 // Limit concurrent API calls to Replicate

  async add(data: Job['data']): Promise<string> {
    const job: Job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data,
      status: 'pending',
      createdAt: new Date(),
    }
    this.queue.push(job)
    this.process() // Start processing if not already
    return job.id
  }

  private async process() {
    if (this.processing) return
    this.processing = true

    while (this.hasPendingJobs()) {
      const jobs = this.queue
        .filter(j => j.status === 'pending')
        .slice(0, this.maxConcurrent)

      if (jobs.length === 0) break

      await Promise.all(jobs.map(job => this.executeJob(job)))
    }

    this.processing = false
  }

  private hasPendingJobs(): boolean {
    return this.queue.some(j => j.status === 'pending')
  }

  private async getObjectVariations(prompt: string): Promise<string[]> {
    // Try OpenAI first
    const openaiVariations = await generateObjectVariations(prompt)
    if (openaiVariations && openaiVariations.length === 4) {
      return openaiVariations
    }

    // Fallback to hardcoded list
    const hardcodedVariations = getHardcodedVariations(prompt)
    if (hardcodedVariations && hardcodedVariations.length === 4) {
      return hardcodedVariations
    }

    // Last resort: use the original prompt 4 times
    // This will generate 4 variations of the same object
    return [prompt, prompt, prompt, prompt]
  }

  private async executeJob(job: Job) {
    job.status = 'processing'
    try {
      const { prompt, styleId, colors } = job.data

      // Get 4 different object variations
      const objectVariations = await this.getObjectVariations(prompt)

      // Generate 4 images, each with a different object prompt
      // Process sequentially to respect Replicate rate limits (6 req/min, burst of 1)
      const images: string[] = []
      const errors: string[] = []

      for (let i = 0; i < 4; i++) {
        const objectPrompt = objectVariations[i]
        const fullPrompt = buildPrompt(objectPrompt, styleId, colors)

        let retries = 0
        const maxRetries = 3
        let imageUrl: string | null = null

        while (retries <= maxRetries && !imageUrl) {
          try {
            const result = await generateImage({
              prompt: fullPrompt,
              aspect_ratio: '1:1',
              num_outputs: 1, // Generate 1 image per call
              output_format: 'png',
            })

            if (result.length > 0) {
              imageUrl = result[0]
              images[i] = imageUrl
              break
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error'

            // Check if it's a rate limit error (429)
            if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
              // Try to extract retry_after from error message
              const retryAfterMatch = errorMessage.match(/retry_after["\s:]+(\d+)/i)
              const retryAfter = retryAfterMatch
                ? parseInt(retryAfterMatch[1], 10) * 1000
                : (retries + 1) * 2000 // Default: exponential backoff

              if (retries < maxRetries) {
                console.log(
                  `Rate limited for image ${i + 1} ("${objectPrompt}"). Retrying in ${retryAfter}ms...`
                )
                await new Promise(resolve => setTimeout(resolve, retryAfter))
                retries++
                continue
              }
            }

            // If not a rate limit error or max retries reached, log and break
            console.error(
              `Error generating image ${i + 1} for "${objectPrompt}":`,
              error
            )
            break
          }
        }

        if (!imageUrl) {
          errors.push(
            `Failed to generate image ${i + 1} for "${objectPrompt}" after ${maxRetries} retries`
          )
        }

        // Add a small delay between requests to respect rate limits
        // Replicate allows 6 requests per minute, so ~10 seconds between requests is safe
        if (i < 3) {
          // Don't delay after the last image
          await new Promise(resolve => setTimeout(resolve, 10000)) // 10 seconds
        }
      }

      // Filter out undefined entries and ensure we have exactly 4 images
      const finalImages = images.filter(
        (img): img is string => img !== undefined && img !== null
      )

      // If we have at least some images, try to continue
      // But if we have less than 4, we need to retry or fail
      if (finalImages.length === 0) {
        throw new Error(
          `Failed to generate any images. Errors: ${errors.join('; ')}`
        )
      }

      if (finalImages.length < 4) {
        // If we got some images but not all, we can either:
        // 1. Retry the failed ones (complex)
        // 2. Fail the job (current approach)
        // For now, we'll fail if we don't have exactly 4
        throw new Error(
          `Only generated ${finalImages.length} out of 4 images. Errors: ${errors.join('; ')}`
        )
      }

      job.result = finalImages
      job.status = 'completed'
      job.completedAt = new Date()

      // Cache the result immediately upon completion
      cache.set(job.data.prompt, job.data.styleId, images, job.data.colors)
    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
      job.completedAt = new Date()
      console.error(`Job ${job.id} failed:`, error)
    }
  }

  getStatus(id: string): Job | null {
    return this.queue.find(j => j.id === id) || null
  }

  // Cleanup old completed/failed jobs (older than 1 hour)
  cleanup() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const beforeCount = this.queue.length
    this.queue = this.queue.filter(
      job =>
        job.status === 'pending' ||
        job.status === 'processing' ||
        (job.completedAt && job.completedAt > oneHourAgo)
    )
    const removed = beforeCount - this.queue.length
    if (removed > 0) {
      console.log(`Queue cleanup: removed ${removed} old jobs`)
    }
  }

  // Get queue stats
  getStats() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(j => j.status === 'pending').length,
      processing: this.queue.filter(j => j.status === 'processing').length,
      completed: this.queue.filter(j => j.status === 'completed').length,
      failed: this.queue.filter(j => j.status === 'failed').length,
    }
  }
}

export const queue = new SimpleQueue()

// Cleanup every 30 minutes
setInterval(
  () => {
    queue.cleanup()
  },
  30 * 60 * 1000
)
