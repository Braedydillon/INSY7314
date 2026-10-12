
import { describe, expect, it } from 'vitest'

describe('Profile page', () => {
  it('loads and provides a default React component', async () => {
    const module = await import('../pages/Profile.jsx')

    expect(module.default).toBeTruthy()
  })
})
