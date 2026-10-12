
import { describe, expect, it } from 'vitest'

describe('MyBookings page', () => {
  it('loads and provides a default React component', async () => {
    const module = await import('../pages/MyBookings.jsx')

    expect(module.default).toBeTruthy()
  })
})
