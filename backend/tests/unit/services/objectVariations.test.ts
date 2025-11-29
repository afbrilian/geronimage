import { getHardcodedVariations } from '../../../src/services/objectVariations.js'

describe('objectVariations', () => {
  it('returns variations for known categories (case-insensitive, trimmed)', () => {
    const toys = getHardcodedVariations('Toys')
    const vehicles = getHardcodedVariations(' vehicles ')

    expect(toys).toEqual(['Bear Toy', 'Car Toy', 'Spinner Toy', 'Swing Toy'])
    expect(vehicles).toEqual(['Car', 'Bus', 'Truck', 'Bike'])
  })

  it('returns null for unknown categories', () => {
    const result = getHardcodedVariations('UnknownCategory')
    expect(result).toBeNull()
  })
})

