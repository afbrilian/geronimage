import {
  STYLE_PRESETS,
  buildPrompt,
  generateVariations,
} from '../../../src/services/promptService.js'

describe('Prompt Service', () => {
  describe('STYLE_PRESETS', () => {
    it('should have 5 style presets', () => {
      expect(STYLE_PRESETS).toHaveLength(5)
    })

    it('should have unique IDs', () => {
      const ids = STYLE_PRESETS.map(preset => preset.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(5)
    })

    it('should have all required fields', () => {
      STYLE_PRESETS.forEach(preset => {
        expect(preset).toHaveProperty('id')
        expect(preset).toHaveProperty('name')
        expect(preset).toHaveProperty('description')
        expect(preset).toHaveProperty('stylePrompt')
        expect(typeof preset.id).toBe('number')
        expect(typeof preset.name).toBe('string')
        expect(typeof preset.description).toBe('string')
        expect(typeof preset.stylePrompt).toBe('string')
      })
    })
  })

  describe('buildPrompt', () => {
    it('should build prompt with style', () => {
      const result = buildPrompt('rocket', 1)
      expect(result).toContain('rocket')
      expect(result).toContain('pastel')
      expect(result).toContain('Single icon')
    })

    it('should build prompt with colors', () => {
      const result = buildPrompt('rocket', 1, ['#FF0000', '#0000FF'])
      expect(result).toContain('rocket')
      expect(result).toContain('#FF0000')
      expect(result).toContain('#0000FF')
    })

    it('should throw error for invalid style ID', () => {
      expect(() => buildPrompt('rocket', 999)).toThrow('Invalid style ID')
    })

    it('should include all style presets in output', () => {
      STYLE_PRESETS.forEach(preset => {
        const result = buildPrompt('test', preset.id)
        expect(result).toContain(preset.stylePrompt)
      })
    })

    it('should add IMPORTANT instruction', () => {
      const result = buildPrompt('rocket', 1)
      expect(result).toContain('IMPORTANT')
      expect(result).toContain('Single icon')
      expect(result).toContain('centered composition')
    })

    it('should handle empty colors array', () => {
      const result = buildPrompt('rocket', 1, [])
      expect(result).not.toContain('Use')
      expect(result).not.toContain('as the main colors')
    })

    it('should join multiple colors with "and"', () => {
      const result = buildPrompt('rocket', 1, ['#FF0000', '#00FF00', '#0000FF'])
      expect(result).toContain('#FF0000 and #00FF00 and #0000FF')
    })
  })

  describe('generateVariations', () => {
    it('should generate 4 variations', () => {
      const result = generateVariations('rocket')
      expect(result).toHaveLength(4)
    })

    it('should include base prompt as first variation', () => {
      const result = generateVariations('rocket')
      expect(result[0]).toBe('rocket')
    })

    it('should include "different" variation', () => {
      const result = generateVariations('rocket')
      expect(result[1]).toBe('different rocket')
    })

    it('should include "variation" suffix', () => {
      const result = generateVariations('rocket')
      expect(result[2]).toBe('rocket variation')
    })

    it('should include "alternative design" variation', () => {
      const result = generateVariations('rocket')
      expect(result[3]).toBe('alternative rocket design')
    })
  })
})

