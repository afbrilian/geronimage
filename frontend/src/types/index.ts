export interface StylePreset {
  id: number
  name: string
  description: string
  stylePrompt: string
}

export type JobStatusType = 'pending' | 'processing' | 'completed' | 'failed'

export interface GenerateRequest {
  prompt: string
  styleId: number
  colors?: string[]
}

export interface GenerateResponse {
  images?: string[]
  jobId?: string
  status?: string
  cached?: boolean
  message?: string
}

export interface JobStatus {
  jobId: string
  status: JobStatusType
  images?: string[]
  error?: string
  createdAt?: string
  completedAt?: string
  message?: string
}

export interface HealthStatus {
  status: string
  timestamp: string
  queue: {
    total: number
    pending: number
    processing: number
    completed: number
    failed: number
  }
}

// Style presets matching backend STYLE_PRESETS
export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 1,
    name: 'Soft Pastel Outline Icon',
    description:
      'Soft pastel hand-drawn icon with thin rounded outline and gentle shading.',
    stylePrompt:
      'Soft pastel hand-drawn icon style with thin rounded purple outline, gentle pastel color fills, very light soft shading, subtle edge softness, minimal detail, friendly and cute aesthetic, centered composition. pastel colors, thin purple outline, soft shading, gentle edges, minimal detail, cute hand-drawn icon, vector-like illustration',
  },
  {
    id: 2,
    name: 'Playful Doodle Orbit',
    description:
      'Playful doodle icon with uneven outlines, stars and dots, and a circular pastel backdrop.',
    stylePrompt:
      'Playful hand-drawn doodle style with slightly uneven dark outlines, soft pastel color fills, small decorative stars and dots, and a light circular pastel backdrop, cheerful and whimsical mood, minimal detail, vector-like look. playful doodle, sketchy outline, pastel palette, decorative stars, circular pastel backdrop, whimsical, minimal detail, vector style',
  },
  {
    id: 3,
    name: 'Storybook Sketch Cloudscape',
    description:
      'Colorful storybook-style sketchy illustration with pastel cloud splash and small accents.',
    stylePrompt:
      'Whimsical full-color storybook illustration style with slightly uneven dark outlines and soft brush-like strokes, rich pastel and soft vibrant colors filling the subject and background, gentle shading, simple decorative elements like fluffy clouds and small stars, placed over a soft mint cloud-shaped background splash with subtly textured edges, not black and white, not line art only. storybook illustration, full color, colorful pastel and soft vibrant colors, sketchy outline, fluffy clouds, small stars, mint cloud backdrop, whimsical illustration, filled shapes, minimal detail',
  },
  {
    id: 4,
    name: 'Glossy Gradient Icon',
    description: 'Modern glossy gradient vector icon with smooth lighting.',
    stylePrompt:
      'Modern glossy gradient icon style with smooth blended gradients, no visible outline, soft highlights and subtle shading, bright saturated colors, clean geometric shapes, slightly 3D lighting, crisp but smooth edges, minimal detail, sleek polished UI-icon look. glossy gradient icon, smooth gradients, no outline, clean vector shapes, subtle highlight, minimal detail, saturated colors, polished modern style',
  },
  {
    id: 5,
    name: 'Monochrome Badge Silhouette',
    description:
      'Minimalist high-contrast silhouette inside a solid circular badge.',
    stylePrompt:
      'Flat monochrome silhouette icon style with a solid circular badge, clean crisp vector shapes, no shading or gradients, strong contrast between subject and background, simple geometric forms, minimal detail, modern symbolic logo-like appearance. silhouette icon, flat design, solid colors, circular badge, high contrast, crisp vector shapes, no shading, minimal detail, logo style',
  },
]

