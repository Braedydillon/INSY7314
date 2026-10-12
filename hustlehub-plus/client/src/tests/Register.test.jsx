
import { describe, expect, it } from 'vitest'

describe('Register page', () => {
  it('loads and provides a default React component', async () => {
    const module = await import('../pages/Register.jsx')

    expect(module.default).toBeTruthy()
  })
})
