# Geronimage - Icon Set Generator

A production-grade web application that generates 4 consistent style icons from a single prompt using Replicate's flux-schnell AI model.

## Project Status

### ✅ Phase 1: Backend Foundation - COMPLETED
- Backend API fully functional
- Queue system implemented
- Caching system implemented
- Rate limiting implemented
- Server running on http://localhost:3001

### 🔄 Phase 2: Backend Testing - NEXT
### ⏳ Phase 3: Frontend Foundation - PENDING
### ⏳ Phase 4: Frontend Integration & Polling - PENDING
### ⏳ Phase 5: Polish & Deployment - PENDING

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- Replicate API (flux-schnell)
- In-memory Queue & Cache
- Express Rate Limit

### Frontend (Coming Soon)
- React + TypeScript + Vite
- Tailwind CSS
- Zustand (State Management)

### Deployment (Coming Soon)
- Backend: Fly.io
- Frontend: Vercel

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
```

Server will start on http://localhost:3001

### Test the API
```bash
# Health check
curl http://localhost:3001/health

# Generate icons
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "toys", "styleId": 1}'

# Check job status (use jobId from previous response)
curl http://localhost:3001/api/status/{jobId}
```

## Features

### Current (Phase 1)
- ✅ 5 style presets (Pastels, Bubbles, Geometric, Watercolor, Flat Design)
- ✅ Queue system for managing concurrent API calls
- ✅ Intelligent caching (24-hour TTL)
- ✅ Rate limiting (100 req/15min general, 20 req/hour for generation)
- ✅ Async job processing with status polling
- ✅ Optional brand color palette support
- ✅ Error handling and validation

### Coming Soon
- Unit and integration tests
- Modern ChatGPT + Airbnb-like UI
- Real-time job status updates
- Downloadable PNG/JPG icons
- Production deployment

## API Endpoints

### POST /api/generate
Generate 4 icons from a prompt.

**Request:**
```json
{
  "prompt": "toys",
  "styleId": 1,
  "colors": ["#FF5733", "#00FF00"]  // optional
}
```

**Response:**
```json
{
  "jobId": "job_xxx",
  "status": "queued"
}
```

### GET /api/status/:jobId
Check generation job status.

**Response:**
```json
{
  "jobId": "job_xxx",
  "status": "completed",
  "images": ["url1", "url2", "url3", "url4"]
}
```

### GET /health
Health check with queue stats.

## Style Presets

| ID | Name | Description |
|----|------|-------------|
| 1 | Pastels | Soft pastel colors, gentle gradients |
| 2 | Bubbles | Bubble-like forms, rounded shapes |
| 3 | Geometric | Clean lines, geometric shapes |
| 4 | Watercolor | Watercolor painting style |
| 5 | Flat Design | Flat design, solid colors |

## Documentation

- [Build Progress](build-progress.md) - Overall build plan and progress
- [Backend README](backend/README.md) - Backend API documentation
- [Phase 1 Summary](PHASE_1_SUMMARY.md) - Phase 1 completion report
- [Backend Checklist](backend/PHASE_1_CHECKLIST.md) - Detailed verification

## Development

See detailed build plan in [build-progress.md](build-progress.md)

## License

MIT

