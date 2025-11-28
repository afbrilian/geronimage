import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const TIMEOUT_MS = 10000 // 10 seconds

export async function generateObjectVariations(
  category: string
): Promise<string[] | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, skipping OpenAI call')
    return null
  }

  const prompt = `Give me 4 different, specific real-world objects that are examples of "${category}". Return only a JSON array of 4 strings, no other text. Each string should be a simple, clear object name.

    Examples:
    - If category is "Toys": ["Bear Toy", "Car Toy", "Spinner Toy", "Swing Toy"]
    - If category is "Vehicles": ["Car", "Bus", "Truck", "Bike"]
    - If category is "Animals": ["Cat", "Dog", "Rabbit", "Bear"]
    - If category is "Food": ["Cookie", "Cupcake", "Ice Cream", "Pizza Slice"]
    - If category is "Fruits": ["Apple", "Banana", "Strawberry", "Orange"]
    - If category is "Vegetables": ["Carrot", "Tomato", "Broccoli", "Bell Pepper"]
    - If category is "Tools": ["Hammer", "Wrench", "Screwdriver", "Pliers"]
    - If category is "Instruments": ["Guitar", "Piano", "Drums", "Violin"]
    - If category is "Sports": ["Basketball", "Soccer Ball", "Tennis Racket", "Baseball"]
    - If category is "Motorcycles": ["Sport Motorcycle", "Cruiser Motorcycle", "Dirt Bike", "Scooter"]
  `

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that returns only JSON arrays. Always return valid JSON with exactly 4 string elements.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      },
      {
        signal: controller.signal as AbortSignal,
      }
    )

    clearTimeout(timeoutId)

    const content = completion.choices[0]?.message?.content
    if (!content) {
      console.error('OpenAI returned empty content')
      return null
    }

    // Try to parse JSON from the response
    // Sometimes OpenAI wraps it in markdown code blocks
    let jsonString = content.trim()
    if (jsonString.startsWith('```')) {
      jsonString = jsonString
        .replace(/^```(?:json)?\n?/i, '')
        .replace(/\n?```$/i, '')
    }

    const variations = JSON.parse(jsonString)

    if (!Array.isArray(variations) || variations.length !== 4) {
      console.error(
        `OpenAI returned invalid format. Expected array of 4 strings, got:`,
        variations
      )
      return null
    }

    // Validate all elements are strings
    if (!variations.every(v => typeof v === 'string' && v.trim().length > 0)) {
      console.error('OpenAI returned array with non-string or empty elements')
      return null
    }

    return variations.map(v => v.trim())
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('OpenAI request timed out')
      } else {
        console.error('OpenAI API error:', error.message)
      }
    } else {
      console.error('Unknown OpenAI error:', error)
    }
    return null
  }
}
