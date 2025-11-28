import { useState } from 'react'
import { Input } from './ui/Input'

interface ColorPickerProps {
  colors: string[]
  onChange: (colors: string[]) => void
  maxColors?: number
}

const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

const QUICK_PALETTES = [
  ['#FF5733', '#33FF57', '#3357FF'],
  ['#FFC300', '#FF5733', '#C70039'],
  ['#900C3F', '#C70039', '#FF5733'],
  ['#581845', '#900C3F', '#C70039'],
  ['#2E86AB', '#A23B72', '#F18F01'],
]

export function ColorPicker({
  colors,
  onChange,
  maxColors = 3,
}: ColorPickerProps) {
  const [errors, setErrors] = useState<string[]>([])

  const validateColor = (color: string): boolean => {
    if (!color) return true // Empty is valid
    return HEX_REGEX.test(color)
  }

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors]
    while (newColors.length <= index) {
      newColors.push('')
    }
    newColors[index] = value.toUpperCase()

    // Validate
    const newErrors = [...errors]
    if (value && !validateColor(value)) {
      newErrors[index] = 'Invalid HEX color format'
    } else {
      newErrors[index] = ''
    }
    setErrors(newErrors)

    // Remove empty trailing colors
    const trimmed = newColors.filter((c, i) => i < maxColors && (c || i < newColors.length - 1))
    onChange(trimmed)
  }

  const handleQuickPalette = (palette: string[]) => {
    onChange(palette.slice(0, maxColors))
    setErrors([])
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {Array.from({ length: maxColors }).map((_, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-1">
              <Input
                label={index === 0 ? 'Color 1 (optional)' : `Color ${index + 1} (optional)`}
                placeholder="#FF5733"
                value={colors[index] || ''}
                onChange={e => handleColorChange(index, e.target.value)}
                error={errors[index]}
                maxLength={7}
              />
            </div>
            {colors[index] && (
              <div
                className="mt-7 w-12 h-12 rounded-lg border-2 border-chat-gray-200 shadow-sm"
                style={{ backgroundColor: colors[index] }}
              />
            )}
          </div>
        ))}
      </div>

      <div>
        <p className="text-sm font-medium text-chat-gray-700 mb-2">
          Quick Palettes:
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PALETTES.map((palette, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPalette(palette)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-chat-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-smooth"
            >
              {palette.slice(0, maxColors).map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded border border-chat-gray-300"
                  style={{ backgroundColor: color }}
                />
              ))}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

