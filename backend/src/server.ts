import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { generateIcons, getJobStatus } from './routes/generate.js'
import { errorHandler } from './utils/errorHandler.js'
import {
  apiLimiter,
  generationLimiter,
  statusLimiter,
} from './middleware/rateLimiter.js'
import { queue } from './services/queue.js'

const app = express()

// Trust proxy - required for Fly.io and other proxy environments
// Trust exactly 1 proxy (Fly.io's reverse proxy)
// This allows Express to correctly read X-Forwarded-* headers while being secure
app.set('trust proxy', 1)

// Middleware
app.use(cors())
app.use(express.json())

// Apply general rate limiting to API routes (excluding status endpoint which has its own limiter)
app.use('/api', (req, res, next) => {
  // Skip rate limiting for status endpoint (it has its own limiter)
  if (req.path.startsWith('/status/')) {
    return next()
  }
  return apiLimiter(req, res, next)
})

// Health check endpoint
app.get('/health', (_req, res) => {
  const queueStats = queue.getStats()
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    queue: queueStats,
  })
})

// API Routes
app.post('/api/generate', generationLimiter, generateIcons)
app.get('/api/status/:jobId', statusLimiter, getJobStatus)

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/generate`)
})
