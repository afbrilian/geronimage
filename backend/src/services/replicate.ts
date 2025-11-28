import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

const MODEL = 'black-forest-labs/flux-schnell'

export interface GenerateOptions {
  prompt: string
  aspect_ratio?: string
  num_outputs?: number
  output_format?: string
  output_quality?: number
}

export async function generateImage(
  options: GenerateOptions
): Promise<string[]> {
  try {
    const output = await replicate.run(MODEL, {
      input: {
        prompt: options.prompt,
        aspect_ratio: options.aspect_ratio || '1:1',
        num_outputs: options.num_outputs || 1,
        output_format: options.output_format || 'png',
        output_quality: options.output_quality || 100,
      },
    })

    // Handle different output formats from Replicate
    if (Array.isArray(output)) {
      return output as string[]
    }

    // If single output, wrap in array
    return [output as unknown as string]
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Replicate API error: ${errorMessage}`)
  }
}
