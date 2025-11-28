import { generateImage } from './replicate.js'
import { buildPrompt } from './promptService.js'
import { cache } from './cache.js'

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

  private async executeJob(job: Job) {
    job.status = 'processing'
    try {
      const { prompt, styleId, colors } = job.data

      // Build a single comprehensive prompt for generating 4 unique icons
      const basePrompt = buildPrompt(prompt, styleId, colors)
      const fullPrompt = `${basePrompt}, generate 4 different unique variations, no duplicates`

      // Generate all 4 icons in a single API call
      const images = await generateImage({
        prompt: fullPrompt,
        aspect_ratio: '1:1',
        num_outputs: 4,
        output_format: 'png',
      })

      if (images.length !== 4) {
        throw new Error(`Expected 4 images, got ${images.length}`)
      }

      job.result = images
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
