# Geronimage Frontend

Frontend application for generating 4 consistent style icons from a single prompt.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Edit `.env` with your backend API URL:

```env
VITE_API_BASE_URL=http://localhost:3001
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Base UI components (Button, Input, Card, Loading)
│   │   ├── PromptForm.tsx
│   │   ├── StyleSelector.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── IconGrid.tsx
│   │   └── LoadingState.tsx
│   ├── stores/            # Zustand stores
│   │   └── iconStore.ts
│   ├── services/          # API client
│   │   └── api.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # React entry point
│   └── index.css          # Global styles and Tailwind directives
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Components

### Base UI Components

- **Button** - Primary/secondary button variants with loading state
- **Input** - Text input with label and error handling
- **Card** - Container component with padding variants
- **Loading** - Spinner component with size variants

### Feature Components

- **PromptForm** - Form for entering prompt, selecting style, and choosing colors
- **StyleSelector** - Grid display of 5 style presets
- **ColorPicker** - HEX color input with validation and quick palettes
- **IconGrid** - 2x2 grid display of generated icons with download functionality
- **LoadingState** - Loading indicator with status messages

## State Management

The app uses Zustand for state management. The `iconStore` manages:

- Form state (prompt, selectedStyleId, colors)
- Job state (images, jobId, status, error, loading)
- Actions for updating state

Note: Polling logic for job status will be added in Phase 4.

## API Integration

The `api.ts` service provides methods for:

- `generateIcons(request)` - POST to `/api/generate`
- `getJobStatus(jobId)` - GET to `/api/status/:jobId`
- `healthCheck()` - GET to `/health`

## Development Notes

- The app uses path aliases (`@/` for `src/`)
- Tailwind CSS is configured with custom colors matching ChatGPT + Airbnb aesthetic
- All components are typed with TypeScript
- Code is formatted with Prettier (mirrors backend config)

## Next Steps (Phase 4)

- Implement job polling logic in Zustand store
- Add real-time status updates
- Enhance error handling and retry logic
- Add success animations

