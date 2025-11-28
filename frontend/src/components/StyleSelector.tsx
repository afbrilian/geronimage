import { Card } from './ui/Card'
import type { StylePreset } from '@/types'

interface StyleSelectorProps {
  presets: StylePreset[]
  selectedStyleId: number | null
  onSelect: (styleId: number) => void
}

export function StyleSelector({
  presets,
  selectedStyleId,
  onSelect,
}: StyleSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {presets.map(preset => {
        const isSelected = selectedStyleId === preset.id
        return (
          <Card
            key={preset.id}
            padding="md"
            hover
            onClick={() => onSelect(preset.id)}
            className={`
              transition-smooth
              ${
                isSelected
                  ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200'
                  : ''
              }
            `}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-chat-gray-900 text-sm">
                  {preset.name}
                </h3>
                {isSelected && (
                  <span className="text-primary-500 text-lg">✓</span>
                )}
              </div>
              <p className="text-xs text-chat-gray-600 line-clamp-2">
                {preset.description}
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

