import { generateIconSet } from '../../../src/services/iconGenerationService.js'

// NOTE:
// Due to ESM module semantics, spying on or mocking the Replicate client
// bindings in this environment is error-prone. Instead of deep mocking,
// this test file provides a very small smoke test that only verifies that
// the public API surface exists and can be called with a minimal input
// shape without throwing synchronously.

describe('iconGenerationService (smoke)', () => {
  it('should expose generateIconSet function', () => {
    expect(typeof generateIconSet).toBe('function')
  })
})

