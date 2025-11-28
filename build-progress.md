# Icon Generator Web App - Build Plan

## Project Overview

Build a web app that generates 4 consistent style icons from a single prompt using Replicate API (flux-schnell). Features include queue system, caching, rate limiting, and modern ChatGPT + Airbnb-like UI.

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Zustand
- **Image Generation**: Replicate API (flux-schnell)
- **Queue**: Simple in-memory queue
- **Caching**: In-memory cache with TTL
- **Rate Limiting**: express-rate-limit
- **Testing**: Jest + Supertest
- **Code Quality**: Prettier + ESLint
- **Deployment**: Backend (Fly.io), Frontend (Vercel)

## Build Phases

### Phase 1: Backend Foundation ✅ (Current Phase)

**Goal**: Set up backend API with core functionality

**Tasks**:

1. Initialize backend project structure
2. Set up TypeScript configuration
3. Install dependencies (express, cors, replicate, express-rate-limit)
4. Create Replicate service wrapper (`backend/src/services/replicate.ts`)
5. Create prompt service for style consistency (`backend/src/services/promptService.ts`)
6. Implement simple in-memory queue (`backend/src/services/queue.ts`)
7. Implement caching system (`backend/src/services/cache.ts`)
8. Create rate limiting middleware (`backend/src/middleware/rateLimiter.ts`)
9. Create API routes (`backend/src/routes/generate.ts`)
10. Set up Express server (`backend/src/server.ts`)
11. Add error handling utilities (`backend/src/utils/errorHandler.ts`)
12. Add Prettier configuration
13. Create basic README

**Files to Create**:

- `backend/package.json`
- `backend/tsconfig.json`
- `backend/.prettierrc`
- `backend/.prettierignore`
- `backend/src/server.ts`
- `backend/src/services/replicate.ts`
- `backend/src/services/promptService.ts`
- `backend/src/services/queue.ts`
- `backend/src/services/cache.ts`
- `backend/src/middleware/rateLimiter.ts`
- `backend/src/routes/generate.ts`
- `backend/src/utils/errorHandler.ts`
- `backend/.env.example`
- `backend/README.md`

**Success Criteria**:

- Backend server runs successfully
- API endpoints respond correctly
- Queue processes jobs
- Cache stores/retrieves results
- Rate limiting works

---

### Phase 2: Backend Testing

**Goal**: Comprehensive test coverage for backend

**Tasks**:

1. Set up Jest testing framework
2. Configure Jest for TypeScript
3. Create unit tests for queue service
4. Create unit tests for cache service
5. Create unit tests for prompt service
6. Create unit tests for Replicate service (mocked)
7. Create integration tests for API routes
8. Add test helpers and mocks
9. Set up test coverage reporting
10. Achieve 70%+ code coverage

**Files to Create**:

- `backend/jest.config.js`
- `backend/tests/unit/services/queue.test.ts`
- `backend/tests/unit/services/cache.test.ts`
- `backend/tests/unit/services/promptService.test.ts`
- `backend/tests/unit/services/replicate.test.ts`
- `backend/tests/integration/routes/generate.test.ts`
- `backend/tests/helpers/mockReplicate.ts`
- `backend/tests/helpers/testUtils.ts`

**Success Criteria**:

- All tests pass
- 70%+ code coverage
- Tests run in CI-ready format

---

### Phase 3: Frontend Foundation

**Goal**: Set up frontend with modern ChatGPT + Airbnb-like UI

**Tasks**:

1. Initialize React + Vite + TypeScript project
2. Set up Tailwind CSS
3. Install and configure Zustand for state management
4. Configure Prettier for frontend
5. Create base UI components (Button, Input, Card, Loading) with modern styling
6. Create PromptForm component with clean design
7. Create StyleSelector component
8. Create ColorPicker component
9. Create IconGrid component with download functionality
10. Create LoadingState component with smooth animations
11. Set up API client service
12. Create Zustand store for job state management
13. Create main App component with clean layout
14. Add error handling and user feedback

**Files to Create**:

- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/tsconfig.json`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/.prettierrc`
- `frontend/.prettierignore`
- `frontend/index.html`
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/components/PromptForm.tsx`
- `frontend/src/components/StyleSelector.tsx`
- `frontend/src/components/ColorPicker.tsx`
- `frontend/src/components/IconGrid.tsx`
- `frontend/src/components/LoadingState.tsx`
- `frontend/src/components/ui/Button.tsx`
- `frontend/src/components/ui/Input.tsx`
- `frontend/src/components/ui/Card.tsx`
- `frontend/src/stores/iconStore.ts` (Zustand store)
- `frontend/src/services/api.ts`
- `frontend/src/types/index.ts`
- `frontend/src/index.css`

**Success Criteria**:

- Frontend runs locally
- Clean, modern UI matching ChatGPT + Airbnb style
- All components render correctly
- Form validation works
- Zustand store is set up

---

### Phase 4: Frontend Integration & Polling

**Goal**: Connect frontend to backend with job polling using Zustand

**Tasks**:

1. Implement Zustand store for job management
2. Implement job polling logic in Zustand store
3. Add real-time status updates via Zustand
4. Handle loading states with Zustand
5. Handle error states with Zustand
6. Add retry logic for failed requests
7. Implement download functionality
8. Add success animations
9. Optimize polling intervals
10. Add request cancellation
11. Test end-to-end flow

**Files to Create/Modify**:

- `frontend/src/stores/iconStore.ts` (Zustand store with polling)
- `frontend/src/services/api.ts` (add polling)
- `frontend/src/App.tsx` (integrate Zustand store)
- `frontend/src/components/IconGrid.tsx` (enhance download)

**Success Criteria**:

- Frontend successfully generates icons
- Polling works smoothly with Zustand
- Downloads work correctly
- Error handling is user-friendly

---

### Phase 5: Polish & Deployment

**Goal**: Final polish and deployment to Fly.io (backend) and Vercel (frontend)

**Tasks**:

1. Add environment variable configuration
2. Set up Fly.io deployment config (`fly.toml`)
3. Set up Vercel deployment config (`vercel.json`)
4. Add health check endpoint
5. Add API documentation
6. Optimize bundle size
7. Add loading skeletons
8. Add toast notifications
9. Final UI polish (ChatGPT + Airbnb style)
10. Deploy backend to Fly.io
11. Deploy frontend to Vercel
12. Test deployed app
13. Update documentation

**Files to Create/Modify**:

- `backend/fly.toml` (Fly.io config)
- `backend/.dockerignore`
- `frontend/vercel.json` (Vercel config)
- `frontend/vite.config.ts` (build optimizations)
- `README.md` (main project README)
- Deployment documentation

**Success Criteria**:

- App deployed and accessible
- All features work in production
- Documentation complete

---

## File Structure

```
geronimage/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── helpers/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── build-progress.md
├── .prettierrc
├── .prettierignore
└── README.md
```

## Key Features

- ✅ Queue system for API rate limiting
- ✅ Caching for identical prompts
- ✅ Rate limiting middleware
- ✅ Clean modern UI (ChatGPT + Airbnb style)
- ✅ Zustand state management
- ✅ Job status polling
- ✅ Download functionality
- ✅ Error handling
- ✅ Comprehensive testing
- ✅ Fly.io + Vercel deployment