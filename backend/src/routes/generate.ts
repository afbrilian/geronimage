import { Request, Response } from 'express'
import { queue } from '../services/queue.js'
import { cache } from '../services/cache.js'

export async function generateIcons(req: Request, res: Response) {
  try {
    const { prompt, styleId, colors } = req.body

    // Validation
    if (!prompt || typeof prompt !== 'string') {
      return res
        .status(400)
        .json({ error: 'Prompt is required and must be a string' })
    }

    if (!styleId || typeof styleId !== 'number') {
      return res
        .status(400)
        .json({ error: 'StyleId is required and must be a number' })
    }

    if (styleId < 1 || styleId > 5) {
      return res.status(400).json({ error: 'StyleId must be between 1 and 5' })
    }

    // Validate colors if provided
    if (colors && !Array.isArray(colors)) {
      return res.status(400).json({ error: 'Colors must be an array' })
    }

    // Check cache first
    const cached = cache.get(prompt, styleId, colors)
    if (cached) {
      return res.json({
        images: cached,
        cached: true,
        message: 'Served from cache',
      })
    }

    // Add job to queue
    const jobId = await queue.add({
      prompt,
      styleId,
      colors,
    })

    return res.json({
      jobId,
      status: 'queued',
      message: 'Icon generation started. Poll /api/status/:jobId for updates',
    })
  } catch (error) {
    console.error('Generation error:', error)
    return res.status(500).json({
      error: 'Failed to queue icon generation',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export async function getJobStatus(req: Request, res: Response) {
  try {
    const { jobId } = req.params
    const job = queue.getStatus(jobId)

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    const response: any = {
      jobId,
      status: job.status,
      createdAt: job.createdAt,
    }

    if (job.status === 'completed' && job.result) {
      response.images = job.result
      response.completedAt = job.completedAt
    }

    if (job.status === 'failed' && job.error) {
      response.error = job.error
      response.completedAt = job.completedAt
    }

    if (job.status === 'processing') {
      response.message = 'Icons are being generated...'
    }

    if (job.status === 'pending') {
      response.message = 'Job is queued and waiting to be processed'
    }

    return res.json(response)
  } catch (error) {
    console.error('Status check error:', error)
    return res.status(500).json({
      error: 'Failed to get job status',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
