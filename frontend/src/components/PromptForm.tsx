import { useState, FormEvent } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Card } from './ui/Card'
import { StyleSelector } from './StyleSelector'
import { ColorPicker } from './ColorPicker'
import { STYLE_PRESETS } from '@/types'

interface PromptFormProps {
  onSubmit: (data: {
    prompt: string
    styleId: number
    colors: string[]
  }) => void
  loading?: boolean
  error?: string | null
  initialPrompt?: string
  initialStyleId?: number | null
  initialColors?: string[]
}

export function PromptForm({
  onSubmit,
  loading = false,
  error,
  initialPrompt = '',
  initialStyleId = null,
  initialColors = [],
}: PromptFormProps) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [selectedStyleId, setSelectedStyleId] = useState<number | null>(
    initialStyleId
  )
  const [colors, setColors] = useState<string[]>(initialColors)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!prompt.trim()) {
      setValidationError('Prompt is required')
      return
    }

    if (!selectedStyleId) {
      setValidationError('Please select a style')
      return
    }

    onSubmit({
      prompt: prompt.trim(),
      styleId: selectedStyleId,
      colors: colors.filter(c => c.trim()),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="space-y-4">
          <Input
            label="Icon Prompt"
            placeholder="e.g., rocket, car, house..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            disabled={loading}
            required
          />

          <div>
            <label className="block text-sm font-medium text-chat-gray-700 mb-3">
              Style Preset
            </label>
            <StyleSelector
              presets={STYLE_PRESETS}
              selectedStyleId={selectedStyleId}
              onSelect={setSelectedStyleId}
            />
          </div>

          <div>
            <ColorPicker
              colors={colors}
              onChange={setColors}
              maxColors={3}
            />
          </div>

          {(error || validationError) && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">
                {error || validationError}
              </p>
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            loadingText="Getting images..."
            className="w-full"
          >
            Generate Icons
          </Button>
        </div>
      </Card>
    </form>
  )
}

