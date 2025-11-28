import { jest } from '@jest/globals'

export const mockReplicateRun = jest.fn<() => Promise<any>>()

export const createMockReplicate = () => ({
  run: mockReplicateRun,
})

export const mockImageUrls = [
  'https://replicate.delivery/test/image-1.png',
  'https://replicate.delivery/test/image-2.png',
  'https://replicate.delivery/test/image-3.png',
  'https://replicate.delivery/test/image-4.png',
]

export const resetMockReplicate = () => {
  mockReplicateRun.mockReset()
}

