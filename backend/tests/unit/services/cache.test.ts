import { cache } from '../../../src/services/cache.js'

describe('Cache Service', () => {
  beforeEach(() => {
    cache.clear()
  })

  describe('set and get', () => {
    it('should store and retrieve cached values', () => {
      const prompt = 'test rocket'
      const styleId = 1
      const images = ['image1.png', 'image2.png']

      cache.set(prompt, styleId, images)
      const result = cache.get(prompt, styleId)

      expect(result).toEqual(images)
    })

    it('should return null for non-existent cache entries', () => {
      const result = cache.get('nonexistent', 999)
      expect(result).toBeNull()
    })

    it('should handle cache with colors', () => {
      const prompt = 'test rocket'
      const styleId = 1
      const colors = ['#FF0000', '#0000FF']
      const images = ['image1.png', 'image2.png']

      cache.set(prompt, styleId, images, colors)
      const result = cache.get(prompt, styleId, colors)

      expect(result).toEqual(images)
    })

    it('should differentiate between same prompt/style with different colors', () => {
      const prompt = 'test rocket'
      const styleId = 1
      const colors1 = ['#FF0000']
      const colors2 = ['#0000FF']
      const images1 = ['red-images.png']
      const images2 = ['blue-images.png']

      cache.set(prompt, styleId, images1, colors1)
      cache.set(prompt, styleId, images2, colors2)

      expect(cache.get(prompt, styleId, colors1)).toEqual(images1)
      expect(cache.get(prompt, styleId, colors2)).toEqual(images2)
    })

    it('should sort colors to ensure consistent cache keys', () => {
      const prompt = 'test'
      const styleId = 1
      const colors1 = ['#FF0000', '#0000FF']
      const colors2 = ['#0000FF', '#FF0000']
      const images = ['image.png']

      cache.set(prompt, styleId, images, colors1)
      const result = cache.get(prompt, styleId, colors2)

      expect(result).toEqual(images)
    })
  })

  describe('clear', () => {
    it('should clear all cache entries', () => {
      cache.set('test1', 1, ['image1.png'])
      cache.set('test2', 2, ['image2.png'])
      cache.set('test3', 3, ['image3.png'])

      cache.clear()

      expect(cache.get('test1', 1)).toBeNull()
      expect(cache.get('test2', 2)).toBeNull()
      expect(cache.get('test3', 3)).toBeNull()
    })
  })

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cache.clear()
      cache.set('test1', 1, ['image1.png'])
      cache.set('test2', 2, ['image2.png'])

      const stats = cache.getStats()

      expect(stats).toHaveProperty('total')
      expect(stats).toHaveProperty('expired')
      expect(stats).toHaveProperty('valid')
      expect(stats.total).toBe(2)
      expect(stats.valid).toBe(2)
    })

    it('should track expired entries', () => {
      cache.clear()
      // Set entry with 1ms TTL
      cache.set('test', 1, ['image.png'], undefined, 1)

      // Wait a bit then check stats
      setTimeout(() => {
        const stats = cache.getStats()
        expect(stats.expired).toBeGreaterThan(0)
      }, 10)
    })
  })

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      cache.clear()
      // Set entry with 1ms TTL
      cache.set('expired', 1, ['image1.png'], undefined, 1)
      cache.set('valid', 2, ['image2.png'], undefined, 10000)

      // Wait for first entry to expire
      await new Promise(resolve => setTimeout(resolve, 10))

      const cleaned = cache.cleanup()

      expect(cleaned).toBe(1)
      expect(cache.get('expired', 1)).toBeNull()
      expect(cache.get('valid', 2)).toEqual(['image2.png'])
    })

    it('should return 0 when no entries expired', () => {
      cache.clear()
      cache.set('test', 1, ['image.png'], undefined, 10000)

      const cleaned = cache.cleanup()

      expect(cleaned).toBe(0)
    })
  })

  describe('TTL expiration', () => {
    it('should return null for expired entries', async () => {
      cache.clear()
      // Set entry with 1ms TTL
      cache.set('test', 1, ['image.png'], undefined, 1)

      // Wait for entry to expire
      await new Promise(resolve => setTimeout(resolve, 10))

      const result = cache.get('test', 1)

      expect(result).toBeNull()
    })

    it('should automatically delete expired entry on get', async () => {
      cache.clear()
      cache.set('test', 1, ['image.png'], undefined, 1)

      await new Promise(resolve => setTimeout(resolve, 10))

      cache.get('test', 1) // This should trigger deletion

      const stats = cache.getStats()
      expect(stats.total).toBe(0)
    })
  })
})

