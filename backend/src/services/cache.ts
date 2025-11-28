interface CacheEntry {
  images: string[]
  createdAt: Date
  expiresAt: Date
}

class Cache {
  private cache = new Map<string, CacheEntry>()
  private defaultTTL = 24 * 60 * 60 * 1000 // 24 hours

  private generateKey(
    prompt: string,
    styleId: number,
    colors?: string[]
  ): string {
    const colorStr = colors ? colors.sort().join(',') : ''
    return `${prompt}:${styleId}:${colorStr}`.toLowerCase()
  }

  get(prompt: string, styleId: number, colors?: string[]): string[] | null {
    const key = this.generateKey(prompt, styleId, colors)
    const entry = this.cache.get(key)

    if (!entry) return null

    // Check if expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    console.log(`Cache hit for key: ${key}`)
    return entry.images
  }

  set(
    prompt: string,
    styleId: number,
    images: string[],
    colors?: string[],
    ttl?: number
  ): void {
    const key = this.generateKey(prompt, styleId, colors)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + (ttl || this.defaultTTL))

    this.cache.set(key, {
      images,
      createdAt: now,
      expiresAt,
    })

    console.log(`Cache set for key: ${key}, expires at: ${expiresAt}`)
  }

  // Cleanup expired entries
  cleanup(): number {
    const now = new Date()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`Cache cleanup: removed ${cleaned} expired entries`)
    }

    return cleaned
  }

  // Get cache stats
  getStats() {
    const now = new Date()
    const entries = Array.from(this.cache.values())
    return {
      total: this.cache.size,
      expired: entries.filter(e => now > e.expiresAt).length,
      valid: entries.filter(e => now <= e.expiresAt).length,
    }
  }

  // Clear all cache (useful for testing)
  clear(): void {
    this.cache.clear()
    console.log('Cache cleared')
  }
}

export const cache = new Cache()

// Cleanup expired entries every hour
setInterval(
  () => {
    cache.cleanup()
  },
  60 * 60 * 1000
)
