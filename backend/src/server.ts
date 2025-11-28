import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { generateIcons, getJobStatus } from './routes/generate.js'
import { errorHandler } from './utils/errorHandler.js'
import { apiLimiter, generationLimiter } from './middleware/rateLimiter.js'
import { queue } from './services/queue.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Apply general rate limiting to all API routes
app.use('/api', apiLimiter)

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
app.get('/api/status/:jobId', getJobStatus)

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/generate`)
})
