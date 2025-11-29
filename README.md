# Geronimage - Icon Set Generator

A production-grade web application that generates 4 consistent style icons from a single prompt using Replicate's flux-schnell AI model.

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

To run the project locally you need to start **both** the backend and the frontend.

### Prerequisites
- Node.js 18+ and npm
- Replicate API token ([Get one here](https://replicate.com/account/api-tokens))
- OpenAI API key (optional, for better object variations)

### Environment Setup

1. Copy environment template:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your API tokens:
```bash
REPLICATE_API_TOKEN=your_token_here
OPENAI_API_KEY=your_key_here  # Optional
# Optional override for frontend API base URL (defaults to http://localhost:3001)
# VITE_API_BASE_URL=http://localhost:3001
```

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Server will start on http://localhost:3001

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will start on http://localhost:5173

### 3. Use the App

1. Open `http://localhost:5173` in your browser.
2. Enter a prompt (e.g., `Toys`), select a style, optionally add HEX colors.
3. Click **Generate Icons**.
4. Wait for the loading state to finish; a 2×2 grid of icons will appear.
5. Download individual icons or all as a ZIP.

### Test the API

```bash
# Health check
curl http://localhost:3001/health

# Generate icons
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "toys", "styleId": 1, "colors": ["#FF5733"]}'

# Check job status (use jobId from previous response)
curl http://localhost:3001/api/status/job_1234567890_abc123
```

## Deployment

### Backend (Fly.io)

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`

2. Login: `fly auth login`

3. Navigate to backend: `cd backend`

4. Launch app: `fly launch` (follow prompts)

5. Set environment variables:
```bash
fly secrets set REPLICATE_API_TOKEN=your_token
fly secrets set OPENAI_API_KEY=your_key  # Optional
```

6. Deploy: `fly deploy`

### Frontend (Vercel)

1. Install Vercel CLI: `npm i -g vercel`

2. Navigate to frontend: `cd frontend`

3. Deploy: `vercel`

4. Set environment variable:
```bash
vercel env add VITE_API_BASE_URL
# Enter your backend URL: https://your-backend.fly.dev
```

5. Redeploy: `vercel --prod`

## Features

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change PORT in .env or kill process on port 3001
lsof -ti:3001 | xargs kill
```

**Replicate API errors:**
- Verify `REPLICATE_API_TOKEN` is set correctly
- Check rate limits (6 requests/minute for accounts with <$5 credit)
- Ensure token has access to `black-forest-labs/flux-schnell` model

**OpenAI API errors:**
- Optional: If not set, system falls back to hardcoded object lists
- Verify `OPENAI_API_KEY` is valid if you want AI-generated variations

### Frontend Issues

**API connection errors:**
- Verify `VITE_API_BASE_URL` points to correct backend URL
- Check CORS configuration on backend
- Ensure backend is running

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Deployment Issues

**Fly.io deployment:**
- Ensure `fly.toml` is in backend directory
- Check environment variables are set: `fly secrets list`
- View logs: `fly logs`

**Vercel deployment:**
- Ensure `vercel.json` is in frontend directory
- Check environment variables in Vercel dashboard
- Verify build command: `npm run build`

## API Endpoints

### POST /api/generate
Generate 4 icons from a prompt. Returns a job ID for async processing.

**Request:**
```json
{
  "prompt": "toys",
  "styleId": 1,
  "colors": ["#FF5733", "#00FF00"]  // optional, up to 3 colors
}
```

**Response (200 OK):**
```json
{
  "jobId": "job_1234567890_abc123",
  "status": "queued",
  "message": "Icon generation started. Poll /api/status/:jobId for updates"
}
```

**Response (Cached - 200 OK):**
```json
{
  "images": ["url1", "url2", "url3", "url4"],
  "cached": true,
  "message": "Served from cache"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input (missing prompt, invalid styleId, etc.)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### GET /api/status/:jobId
Check generation job status. Poll this endpoint until status is "completed" or "failed".

**Response (200 OK - Pending):**
```json
{
  "jobId": "job_1234567890_abc123",
  "status": "pending",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "message": "Job is queued and waiting to be processed"
}
```

**Response (200 OK - Processing):**
```json
{
  "jobId": "job_1234567890_abc123",
  "status": "processing",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "message": "Icons are being generated..."
}
```

**Response (200 OK - Completed):**
```json
{
  "jobId": "job_1234567890_abc123",
  "status": "completed",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:01:00.000Z",
  "images": ["url1", "url2", "url3", "url4"]
}
```

**Response (200 OK - Failed):**
```json
{
  "jobId": "job_1234567890_abc123",
  "status": "failed",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:00:30.000Z",
  "error": "Error message describing what went wrong"
}
```

**Error Responses:**
- `404 Not Found`: Job ID not found
- `429 Too Many Requests`: Rate limit exceeded (status polling)
- `500 Internal Server Error`: Server error

### GET /health
Health check endpoint with queue statistics.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "queue": {
    "total": 5,
    "pending": 2,
    "processing": 1,
    "completed": 1,
    "failed": 1
  }
}
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Generation Endpoint**: 20 requests per hour per IP
- **Status Endpoint**: 60 requests per minute per IP (for polling)

Rate limit responses include `Retry-After` header indicating when to retry.

## Style Presets

| ID | Name | Description |
|----|------|-------------|
| 1 | Soft Pastel Outline Icon | Soft pastel hand-drawn icon with thin rounded outline and gentle shading |
| 2 | Playful Doodle Orbit | Playful doodle icon with uneven outlines, stars and dots, and a circular pastel backdrop |
| 3 | Storybook Sketch Cloudscape | Colorful storybook-style sketchy illustration with pastel cloud splash and small accents |
| 4 | Glossy Gradient Icon | Modern glossy gradient vector icon of a single toy-like object with smooth lighting |
| 5 | Monochrome Badge Silhouette | Strict two-color silhouette icon: one solid circle and one solid object shape, no outlines, no shading, no details |

## Features

- ✅ **4 Different Icons**: Generates 4 unique, themed icons per prompt
- ✅ **5 Style Presets**: Consistent visual styles across all icons
- ✅ **512×512 PNG Output**: All downloads are exactly 512×512 pixels
- ✅ **Optional Color Palette**: Apply up to 3 HEX color codes
- ✅ **Smart Object Variations**: Uses OpenAI to generate diverse object types
- ✅ **Queue System**: Manages API rate limits efficiently
- ✅ **Caching**: 24-hour cache for identical prompts
- ✅ **Real-time Updates**: Polling-based job status updates
- ✅ **Download Options**: Individual or ZIP download of all icons
- ✅ **Modern UI**: ChatGPT + Airbnb-inspired design

## Documentation

- [Backend README](backend/README.md) - Backend API documentation
- [Frontend README](frontend/README.md) - Frontend setup and usage

## Development

See detailed build plan in [build-progress.md](build-progress.md)

## License

MIT

