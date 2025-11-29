import { generateImage } from './replicate.js'
import { buildPrompt } from './promptService.js'
import { generateObjectVariations } from './openaiService.js'
import { getHardcodedVariations } from './objectVariations.js'

export interface IconGenerationInput {
  prompt: string
  styleId: number
  colors?: string[]
}

async function resolveObjectVariations(prompt: string): Promise<string[]> {
  // Try OpenAI first
  const openaiVariations = await generateObjectVariations(prompt)
  if (openaiVariations && openaiVariations.length === 4) {
    return openaiVariations
  }

  // Fallback to hardcoded list
  const hardcodedVariations = getHardcodedVariations(prompt)
  if (hardcodedVariations && hardcodedVariations.length === 4) {
    return hardcodedVariations
  }

  // Last resort: use the original prompt 4 times
  // This will still generate 4 variations of the same base concept
  return [prompt, prompt, prompt, prompt]
}

async function generateSingleIcon(
  objectPrompt: string,
  styleId: number,
  colors?: string[]
): Promise<string | null> {
  const fullPrompt = buildPrompt(objectPrompt, styleId, colors)

  let retries = 0
  const maxRetries = 3

  while (retries <= maxRetries) {
    try {
      const result = await generateImage({
        prompt: fullPrompt,
        aspect_ratio: '1:1',
        num_outputs: 1, // Generate 1 image per call
        output_format: 'png',
      })

      if (result.length > 0) {
        return result[0]
      }
      // If no result, fall through to retry logic below
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'

      // Check if it's a rate limit error (429)
      if (
        errorMessage.includes('429') ||
        errorMessage.toLowerCase().includes('rate limit')
      ) {
        // Try to extract retry_after from error message
        const retryAfterMatch = errorMessage.match(/retry_after["\s:]+(\d+)/i)
        const retryAfter = retryAfterMatch
          ? parseInt(retryAfterMatch[1], 10) * 1000
          : (retries + 1) * 2000 // Default: exponential backoff

        if (retries < maxRetries) {
          console.log(
            `Rate limited for "${objectPrompt}". Retrying in ${retryAfter}ms...`
          )
          await new Promise(resolve => setTimeout(resolve, retryAfter))
          retries++
          continue
        }
      }

      // If not a rate limit error or max retries reached, log and stop
      console.error(`Error generating icon for "${objectPrompt}":`, error)
      return null
    }

    // If we had an empty result but no exception, treat it as a failure and retry
    if (retries < maxRetries) {
      retries++
      continue
    }

    break
  }

  return null
}

export async function generateIconSet(
  input: IconGenerationInput
): Promise<string[]> {
  const { prompt, styleId, colors } = input

  // Resolve 4 different object variations
  const objectVariations = await resolveObjectVariations(prompt)

  const images: string[] = []
  const errors: string[] = []

  // Generate 4 images sequentially to respect Replicate rate limits
  for (let i = 0; i < 4; i++) {
    const objectPrompt = objectVariations[i]
    const imageUrl = await generateSingleIcon(objectPrompt, styleId, colors)

    if (imageUrl) {
      images[i] = imageUrl
    } else {
      errors.push(
        `Failed to generate image ${i + 1} for "${objectPrompt}" after multiple attempts`
      )
    }

    // Add a small delay between requests to respect rate limits
    // Replicate allows 6 requests per minute (for low-credit accounts),
    // so ~10 seconds between requests is safe.
    if (i < 3) {
      await new Promise(resolve => setTimeout(resolve, 10000)) // 10 seconds
    }
  }

  const finalImages = images.filter(
    (img): img is string => img !== undefined && img !== null
  )

  if (finalImages.length === 0) {
    throw new Error(
      `Failed to generate any images. Errors: ${errors.join('; ')}`
    )
  }

  if (finalImages.length < 4) {
    throw new Error(
      `Only generated ${finalImages.length} out of 4 images. Errors: ${errors.join(
        '; '
      )}`
    )
  }

  return finalImages
}
