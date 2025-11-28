export interface StylePreset {
  id: number
  name: string
  description: string
  stylePrompt: string
}

export const STYLE_PRESETS: StylePreset[] = [
  //
  // STYLE 1 — soft pastel, outline, no extra background shapes
  //
  {
    id: 1,
    name: 'Soft Pastel Outline Icon',
    description:
      'Soft pastel hand-drawn icon with thin rounded outline and gentle shading.',
    stylePrompt:
      'Soft pastel hand-drawn icon style with a thin rounded colored outline and soft pastel colors fully filling the main object, no large white uncolored areas. Gentle soft shading, smooth edges, minimal detail, friendly cute proportions, one simple object centered in the frame, no extra background shapes or scenery. full-color pastel icon, thin outline, solid pastel fills, soft shading, smooth edges, kawaii, vector-like illustration, filled shapes, minimal detail, not black and white, not line art only',
  },

  //
  // STYLE 2 — doodle + circular pastel backdrop + stars/dots
  //
  {
    id: 2,
    name: 'Playful Doodle Orbit',
    description:
      'Playful doodle icon with uneven outlines, stars and dots, and a circular pastel backdrop.',
    stylePrompt:
      'Playful hand-drawn doodle icon style with a slightly uneven dark outline around the main object, full-color pastel fills, and a soft circular pastel backdrop behind it. Small colorful decorative stars and dots orbiting around the object, cheerful and whimsical mood, minimal detail, vector-like look, one clear object in the center. playful doodle, sketchy outline, full-color pastel fills, circular pastel background, decorative stars, confetti dots, whimsical, minimal detail, vector style, filled shapes, not black and white, not line art only',
  },

  //
  // STYLE 3 — storybook + mint cloud splash + clouds & stars
  //
  {
    id: 3,
    name: 'Storybook Sketch Cloudscape',
    description:
      'Colorful storybook-style illustration with pastel cloud splash and small accents.',
    stylePrompt:
      'Cute full-color storybook cartoon illustration style with slightly uneven dark outlines and soft brush-like strokes. Solid pastel and soft vibrant colors fully filling the object, gentle shading, rounded and friendly proportions. The object sits over a soft mint cloud-shaped background splash with subtly textured edges, with a few fluffy cartoon clouds and small stars around it, dreamy and whimsical mood, one main object. storybook cartoon illustration, full color, solid pastel fills, soft vibrant colors, sketchy outline, fluffy clouds, small stars, mint cloud backdrop, whimsical, filled shapes, minimal detail',
  },

  //
  // STYLE 4 — glossy 3D gradient toy, no complex background
  //
  {
    id: 4,
    name: 'Glossy Gradient Icon',
    description:
      'Modern glossy gradient vector icon of a single toy-like object with smooth lighting.',
    stylePrompt:
      'A single small toy-like object shown as a modern glossy gradient icon, with smooth blended color gradients on the object, soft highlights and subtle shading, bright but harmonious colors, clean rounded geometric forms, slightly 3D lighting, crisp but smooth edges, minimal detail, cute and friendly character-like feeling. Background should be plain or a very soft halo so the object stands out, no complex scenery or extra shapes. glossy 3D toy icon, smooth gradients, soft highlight, clean rounded shapes, minimal detail, cute character, polished modern style, plain background, no complex scene',
  },

  //
  // STYLE 5 — strict monochrome silhouette inside a circle
  //
  {
    id: 5,
    name: 'Monochrome Badge Silhouette',
    description:
      'Strict two-color silhouette icon: one solid circle and one solid object shape, no outlines, no shading, no details.',
    stylePrompt:
      'A very simple two-color pictogram icon made of only a solid circular badge and one solid silhouette of the object inside it. Use exactly two flat colors total: one flat color for the circle and one flat contrasting color for the silhouette. The silhouette must be a completely filled shape with no interior lines, no face details, no separate colored parts, no outlines or strokes, no gradients, no shadows, no glow, no texture, and no extra decorations. No additional background shapes or scenery, only the circle and the silhouette. Clean, minimal, flat vector symbol, centered composition. two-color icon only, solid circle background, solid silhouette shape, flat vector, no shading, no gradients, no outline, no interior details, high contrast, minimal, logo-like, no text',
  },
]

// --------- helpers for subject resolution ----------

function isCategoryWord(word: string): boolean {
  const w = word.toLowerCase().trim()
  if (w.length <= 2) return false
  if (w.endsWith('ss')) return false
  return w.endsWith('s')
}

function resolveSubject(basePrompt: string): string {
  const raw = basePrompt.trim()
  const word = raw.toLowerCase()

  // category-like cases first, based on simple includes
  if (word.includes('toy')) {
    return 'a single children’s toy such as a teddy bear, toy car, stuffed animal, doll, robot toy, ball, or building block'
  }

  if (word.includes('car') || word.includes('vehicle')) {
    return 'a single car such as a sedan, SUV, sports car, hatchback, or compact city car'
  }

  if (word.includes('animal') || word.includes('pet')) {
    return 'a single cute animal such as a cat, dog, rabbit, bear, or similar pet-like creature'
  }

  if (word.includes('food') || word.includes('snack')) {
    return 'a single piece of food or snack such as a cookie, cupcake, ice cream, slice of pizza, or candy'
  }

  if (word.includes('fruit')) {
    return 'a single fruit such as an apple, banana, strawberry, orange, or bunch of grapes'
  }

  if (word.includes('vegetable')) {
    return 'a single vegetable such as a carrot, tomato, broccoli floret, or bell pepper'
  }

  // generic plural category: "toys", "cars", "animals", etc.
  if (isCategoryWord(word)) {
    return `a single everyday object that is a typical, easily recognizable example of "${raw}"`
  }

  // default: treat as specific object description
  return `a single ${raw}`
}

// --------- prompt builders ----------

export function buildPrompt(
  basePrompt: string,
  styleId: number,
  colorPalette?: string[]
): string {
  const style = STYLE_PRESETS.find(s => s.id === styleId)
  if (!style) {
    throw new Error(`Invalid style ID: ${styleId}`)
  }

  const subjectPhrase = resolveSubject(basePrompt)

  // Strongly bias toward a real-world, everyday physical object
  let prompt =
    `A small illustrated icon of ${subjectPhrase}. ` +
    `It must be a physical real-world object, not text, not a label, not a sign, and not a logo or UI element. ` +
    `Draw it in the following visual style: ${style.stylePrompt}`

  // Add brand colors naturally if provided
  if (colorPalette && colorPalette.length > 0) {
    const colors = colorPalette.join(' and ')
    prompt += ` Use ${colors} as the main colors of the object whenever it makes sense.`
  }

  // Reinforce icon + no-text constraints (short, but clear)
  prompt +=
    ' Only one object in the image. No text, no words, no letters, no labels, no logos. Icon-style composition with a single centered subject on a transparent background, no extra objects or scenery.'

  return prompt
}

export function buildVariationPrompt(
  basePrompt: string,
  styleId: number,
  colorPalette?: string[]
): string {
  const baseIconPrompt = buildPrompt(basePrompt, styleId, colorPalette)
  const trimmed = basePrompt.trim()

  const variationInstruction =
    ` Generate 4 distinct icon variations based on this description. ` +
    `Each variation MUST depict a different kind of real-world object that still fits "${trimmed}". ` +
    `For example, if "${trimmed}" is toys, one image could be a teddy bear toy, another a toy car, another building blocks, another a robot toy. ` +
    `Do not repeat the same object type across the 4 images. ` +
    `Every image must contain only one object, no groups and no collections. ` +
    `No text, no words, no letters, no labels, no logos. One centered object per image, transparent background.`

  return `${baseIconPrompt}${variationInstruction}`
}

export function generateVariations(basePrompt: string): string[] {
  const trimmed = basePrompt.trim()
  return [
    trimmed,
    `different ${trimmed}`,
    `${trimmed} variation`,
    `alternative ${trimmed} design`,
  ]
}
