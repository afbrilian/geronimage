# Icon Generator Backend

Backend API for generating 4 consistent style icons from a single prompt using Replicate's flux-schnell model.

## Features

- 🎨 5 style presets (Pastels, Bubbles, Geometric, Watercolor, Flat Design)
- 🎯 Queue system for managing concurrent API calls
- 💾 Intelligent caching for identical prompts (24-hour TTL)
- 🛡️ Rate limiting (100 req/15min general, 20 req/hour for generation)
- ⚡ Async job processing with status polling
- 🎨 Optional brand color palette support

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3001
NODE_ENV=development
REPLICATE_API_TOKEN=your_token_here
```

### 3. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### POST /api/generate

Generate a set of 4 icons.

**Request Body:**
```json
{
  "prompt": "toys",
  "styleId": 1,
  "colors": ["#FF5733", "#00FF00"]  // optional
}
```

**Response (Cached):**
```json
{
  "images": ["url1", "url2", "url3", "url4"],
  "cached": true,
  "message": "Served from cache"
}
```

**Response (Queued):**
```json
{
  "jobId": "job_1234567890_abc123",
  "status": "queued",
  "message": "Icon generation started. Poll /api/status/:jobId for updates"
}
```

### GET /api/status/:jobId

Check the status of a generation job.

**Response (Pending):**
```json
{
  "jobId": "job_1234567890_abc123",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "message": "Job is queued and waiting to be processed"
}
```

**Response (Processing):**
```json
{
  "jobId": "job_1234567890_abc123",
  "status": "processing",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "message": "Icons are being generated..."
}
```

**Response (Completed):**
```json
{
  "jobId": "job_1234567890_abc123",
  "status": "completed",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:01:30.000Z",
  "images": ["url1", "url2", "url3", "url4"]
}
```

**Response (Failed):**
```json
{
  "jobId": "job_1234567890_abc123",
  "status": "failed",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:01:30.000Z",
  "error": "Replicate API error: ..."
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "queue": {
    "total": 5,
    "pending": 2,
    "processing": 1,
    "completed": 2,
    "failed": 0
  }
}
```

## Style Presets

| ID | Name | Description |
|----|------|-------------|
| 1 | Pastels | Soft pastel colors, gentle gradients |
| 2 | Bubbles | Bubble-like forms, rounded shapes |
| 3 | Geometric | Clean lines, geometric shapes |
| 4 | Watercolor | Watercolor painting style |
| 5 | Flat Design | Flat design, solid colors |

## Architecture

### Services

- **replicate.ts**: Wrapper for Replicate API
- **promptService.ts**: Style presets and prompt building logic
- **queue.ts**: In-memory job queue with concurrency control
- **cache.ts**: In-memory cache with TTL for identical prompts

### Middleware

- **rateLimiter.ts**: Express rate limiting middleware

### Routes

- **generate.ts**: Icon generation and status check handlers

### Utils

- **errorHandler.ts**: Centralized error handling

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Queue System

- Maximum 2 concurrent API calls to Replicate
- Jobs automatically processed in order
- Old completed jobs cleaned up every 30 minutes

### Cache System

- 24-hour TTL for cached results
- Expired entries cleaned up every hour
- Cache key: `prompt:styleId:colors`

### Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Generation endpoint: 20 requests per hour per IP
- Returns 429 status code when limit exceeded

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Set environment variables on your hosting platform

3. Start the production server:
```bash
npm start
```

## Error Handling

All errors return a consistent format:

```json
{
  "error": "Error message",
  "status": 500,
  "path": "/api/generate",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## License

MIT

