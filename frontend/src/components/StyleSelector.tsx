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
    <div className="flex flex-col gap-3">
      {presets.map(preset => {
        const isSelected = selectedStyleId === preset.id
        return (
          <Card
            key={preset.id}
            padding="md"
            hover
            onClick={() => onSelect(preset.id)}
            className={`
              transition-smooth cursor-pointer
              ${
                isSelected
                  ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200'
                  : ''
              }
            `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-chat-gray-900 text-sm mb-1">
                  {preset.name}
                </h3>
                <p className="text-xs text-chat-gray-600 line-clamp-2">
                  {preset.description}
                </p>
              </div>
              {isSelected && (
                <span className="text-primary-500 text-lg flex-shrink-0">✓</span>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

